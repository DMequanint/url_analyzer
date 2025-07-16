// Package repositories provides database access logic and abstractions,
// separating raw GORM operations from controller and service layers.
package repositories

import (
	"github.com/DMequanint/url-analyzer-pro/config"
	"github.com/DMequanint/url-analyzer-pro/models"
)

/*
GetAllUrlAnalyses retrieves all URL analysis records from the database.

Each record is preloaded with its related BrokenLinks (if any).
Returns the list of results or an error if the query fails.
*/
func GetAllUrlAnalyses() ([]models.UrlAnalysis, error) {
	var analyses []models.UrlAnalysis
	err := config.DB.Preload("BrokenLinks").Find(&analyses).Error
	return analyses, err
}

/*
GetUrlAnalysisByID retrieves a single URL analysis record by its numeric ID.

Returns the record with preloaded BrokenLinks or an error if not found.
*/
func GetUrlAnalysisByID(id uint) (models.UrlAnalysis, error) {
	var analysis models.UrlAnalysis
	err := config.DB.Preload("BrokenLinks").First(&analysis, id).Error
	return analysis, err
}

/*
CreateUrlAnalysis inserts a new analysis record into the database.

Returns any error encountered during insertion.
*/
func CreateUrlAnalysis(analysis *models.UrlAnalysis) error {
	return config.DB.Create(analysis).Error
}
