// Package config handles environment configuration and database connection.
// It provides a shared `DB` instance used across the application.
package config

import (
	"fmt"
	"log"
	"os"

	"github.com/joho/godotenv"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// DB is the global GORM database connection shared across the app.
var DB *gorm.DB

/*
ConnectDatabase establishes a GORM connection to a MySQL database.

It loads configuration values from environment variables —
including credentials and host information. If any required
variable is missing or the database connection fails, the
function logs a fatal message and exits the program.
*/
func ConnectDatabase() {
	_ = godotenv.Load()

	user := os.Getenv("DB_USER")
	password := os.Getenv("DB_PASSWORD")
	host := os.Getenv("DB_HOST")
	port := os.Getenv("DB_PORT")
	name := os.Getenv("DB_NAME")

	if user == "" || password == "" || host == "" || port == "" || name == "" {
		log.Fatal("Missing one or more required database environment variables")
	}

	dsn := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		user, password, host, port, name)

	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Error),
	})
	if err != nil {
		log.Fatal("Failed to connect to database: ", err)
	}

	DB = db

	sqlDB, err := DB.DB()
	if err != nil {
		log.Fatal("Failed to access DB object: ", err)
	}

	if err := sqlDB.Ping(); err != nil {
		log.Fatal("Failed to ping the database: ", err)
	}

	log.Println("Connected to MySQL database successfully")
}

