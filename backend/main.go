// main.go
//
// Entry point for the URL Analyzer backend server.
// This Go application initializes the database, schedules background URL analyses,
// handles WebSocket connections for real-time status updates,
// and exposes a REST API using the Gin web framework.

package main

import (
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/joho/godotenv"

	"github.com/DMequanint/url-analyzer-pro/config"
	"github.com/DMequanint/url-analyzer-pro/controllers"
	"github.com/DMequanint/url-analyzer-pro/models"
	"github.com/DMequanint/url-analyzer-pro/pkg/websockethub"
	"github.com/DMequanint/url-analyzer-pro/services"
)

// upgrader configures the WebSocket connection to allow connections from any origin.
var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool {
		return true
	},
}

// handleWS upgrades a GET request to a WebSocket connection and registers the client.
func handleWS(c *gin.Context) {
	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		// Do not log WebSocket upgrade errors to prevent log noise
		return
	}
	websockethub.Register(conn)
}

func main() {
	// Load environment variables from .env if it exists
	_ = godotenv.Load()

	// Set the Gin mode to Release to minimize console logging
	gin.SetMode(gin.ReleaseMode)

	// Load configuration from environment variables or use defaults
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	intervalSec, _ := strconv.Atoi(os.Getenv("ANALYZE_INTERVAL"))
	if intervalSec <= 0 {
		intervalSec = 10
	}

	timeoutSec, _ := strconv.Atoi(os.Getenv("ANALYZE_TIMEOUT"))
	if timeoutSec <= 0 {
		timeoutSec = 15
	}

	workerCount, _ := strconv.Atoi(os.Getenv("ANALYZE_WORKER_COUNT"))
	if workerCount <= 0 {
		workerCount = 1
	}

	// Connect to the database and run auto-migrations
	config.ConnectDatabase()
	if err := config.DB.AutoMigrate(&models.URL{}); err != nil {
		log.Fatalf("Failed to auto-migrate schema: %v", err)
	}

	// Start a background goroutine to process queued URLs at regular intervals
	go func() {
		ticker := time.NewTicker(time.Duration(intervalSec) * time.Second)
		defer ticker.Stop()
		timeout := time.Duration(timeoutSec) * time.Second

		for range ticker.C {
			var queued []models.URL
			if err := config.DB.Where("status = ?", "queued").Find(&queued).Error; err != nil {
				continue
			}

			// Limit concurrency using a buffered channel as a semaphore
			semaphore := make(chan struct{}, workerCount)

			for i := range queued {
				url := &queued[i]

				url.Status = "running"
				_ = config.DB.Save(url)

				websockethub.BroadcastStatusUpdate(map[string]interface{}{
					"id":     url.ID,
					"status": "running",
				})

				semaphore <- struct{}{} // Blocks if worker limit is reached

				// Run analysis in a separate goroutine
				go func(u *models.URL) {
					defer func() { <-semaphore }()

					result := make(chan bool, 1)

					go func() {
						err := services.AnalyzeURL(u)
						if err != nil {
							u.Status = "error"
							u.ErrorReason = err.Error()
						} else {
							u.Status = "done"
						}
						config.DB.Save(u)
						result <- true
					}()

					select {
					case <-result:
						// Completed (success or error)
					case <-time.After(timeout):
						u.Status = "error"
						u.ErrorReason = "Timed out"
						config.DB.Save(u)
					}

					// Notify clients via WebSocket with full analysis results
					websockethub.BroadcastStatusUpdate(map[string]interface{}{
						"id":                u.ID,
						"status":            u.Status,
						"pageTitle":         u.PageTitle,
						"htmlVersion":       u.HTMLVersion,
						"internalLinks":     u.InternalLinksCount,
						"externalLinks":     u.ExternalLinksCount,
						"inaccessibleLinks": u.InaccessibleLinksCount,
						"hasLoginForm":      u.HasLoginForm,
						"errorCode":         u.ErrorCode,
						"errorReason":       u.ErrorReason,
					})
				}(url)
			}
		}
	}()

	// Set up the Gin router with minimal logging and recovery middleware
	r := gin.New()
	r.Use(gin.Recovery())

	// Set up CORS policy to allow cross-origin requests from all sources
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization", "Accept"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Define REST API routes
	r.GET("/api/urls", controllers.GetAllUrls)
	r.GET("/api/urls/:id", controllers.GetUrlByID)
	r.POST("/api/urls", controllers.CreateUrl)
	r.POST("/api/urls/:id/analyze", controllers.AnalyzeUrlByID)
	r.POST("/api/urls/:id/retry", controllers.RetryUrlAnalysis)
	r.DELETE("/api/urls/:id", controllers.DeleteUrl)

	// Define the WebSocket route
	r.GET("/ws", handleWS)

	// Start the HTTP server
	log.Printf("Server is running at http://localhost:%s", port)
	if err := r.Run(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}

