// Package controllers defines HTTP handlers for URL CRUD operations
// used by the URL analyzer REST API and WebSocket update broadcasting.
package controllers

import (
	"net/http"

	"github.com/DMequanint/url-analyzer-pro/config"
	"github.com/DMequanint/url-analyzer-pro/models"
	"github.com/DMequanint/url-analyzer-pro/pkg/websockethub"
	"github.com/gin-gonic/gin"
)

/*
GetAllUrls handles GET /api/urls.

Returns a list of all URLs ordered by creation time (descending).
On database failure, returns 500 Internal Server Error.
*/
func GetAllUrls(c *gin.Context) {
	var urls []models.URL
	if err := config.DB.Order("created_at desc").Find(&urls).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Unable to fetch URLs"})
		return
	}
	c.JSON(http.StatusOK, urls)
}

/*
GetUrlByID handles GET /api/urls/:id.

Returns the URL metadata for a given ID, or a 404 if not found.
*/
func GetUrlByID(c *gin.Context) {
	var url models.URL
	if err := config.DB.First(&url, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}
	c.JSON(http.StatusOK, url)
}

/*
CreateUrl handles POST /api/urls.

Accepts a JSON payload with a URL string and persists it for analysis.
Initial status is set to "queued". Broadcasts the URL over WebSocket.

Example request:
{
	"url": "https://example.com"
}
*/
func CreateUrl(c *gin.Context) {
	var req struct {
		URL string `json:"url"`
	}
	if err := c.BindJSON(&req); err != nil || req.URL == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid URL"})
		return
	}

	newURL := models.URL{
		URL:           req.URL,
		NormalizedURL: req.URL, // Normalization can be added here
		Status:        "queued",
	}

	if err := config.DB.Create(&newURL).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save URL"})
		return
	}

	// Notify clients about the new URL
	websockethub.BroadcastStatusUpdate(map[string]interface{}{
		"id":            newURL.ID,
		"url":           newURL.URL,
		"normalizedURL": newURL.NormalizedURL,
		"status":        newURL.Status,
	})

	c.JSON(http.StatusCreated, newURL)
}

/*
AnalyzeUrlByID handles POST /api/urls/:id/analyze.

Resets URL analysis values and marks it as "queued"
so the background analyzer includes it in the next scan.
*/
func AnalyzeUrlByID(c *gin.Context) {
	var url models.URL
	if err := config.DB.First(&url, "id = ?", c.Param("id")).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "URL not found"})
		return
	}

	// Reset analysis properties
	url.Status = "queued"
	url.ErrorReason = ""
	url.ErrorCode = 0
	url.PageTitle = ""
	url.HTMLVersion = ""
	url.InternalLinksCount = 0
	url.ExternalLinksCount = 0
	url.InaccessibleLinksCount = 0
	url.HasLoginForm = false

	if err := config.DB.Save(&url).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to queue analysis"})
		return
	}

	// Notify clients of the update
	websockethub.BroadcastStatusUpdate(map[string]interface{}{
		"id":     url.ID,
		"status": url.Status,
	})

	c.JSON(http.StatusOK, url)
}

/*
RetryUrlAnalysis handles POST /api/urls/:id/retry.

It’s an alias for AnalyzeUrlByID.
*/
func RetryUrlAnalysis(c *gin.Context) {
	AnalyzeUrlByID(c)
}

/*
DeleteUrl handles DELETE /api/urls/:id.

Deletes the URL and broadcasts its removal.
Returns 204 No Content on success.
*/
func DeleteUrl(c *gin.Context) {
	id := c.Param("id")
	if err := config.DB.Delete(&models.URL{}, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to delete URL"})
		return
	}

	websockethub.BroadcastStatusUpdate(map[string]interface{}{
		"id":     id,
		"status": "deleted",
	})

	c.Status(http.StatusNoContent)
}

