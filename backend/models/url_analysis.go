// Package models defines the data structures used across the application,
// including database models managed via GORM ORM.
package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

/*
URL represents the metadata and crawl results for a submitted website.

This model stores:
- the original and normalized URL,
- status of analysis (queued, running, done, error),
- page structure details (headings, links),
- login form detection,
- error details if the analysis fails.

Fields are serialized to JSON and mapped to GORM-managed MySQL columns.
*/
type URL struct {
	ID                     string    `gorm:"primaryKey" json:"id"`                 // Unique UUID primary key
	URL                    string    `json:"url"`                                  // Raw URL input from user
	NormalizedURL          string    `gorm:"index" json:"normalized_url"`          // Normalized version for deduplication
	PageTitle              string    `json:"pageTitle"`                            // Extracted <title> from the page
	HTMLVersion            string    `json:"htmlVersion"`                          // Detected HTML doctype/version
	InternalLinksCount     int       `json:"internalLinks"`                        // Count of internal links on page
	ExternalLinksCount     int       `json:"externalLinks"`                        // Count of external links
	InaccessibleLinksCount int       `json:"inaccessibleLinks"`                    // Links that failed to load
	HasLoginForm           bool      `json:"hasLoginForm"`                         // Indicates presence of a login form
	ErrorReason            string    `json:"errorReason"`                          // If failed, reason string to display
	ErrorCode              int       `json:"errorCode"`                            // HTTP or custom error code (e.g. 408)
	Status                 string    `gorm:"index" json:"status"`                  // queued, running, done, error
	CreatedAt              time.Time `json:"created_at"`                           // Timestamp when URL was submitted
}

/*
BeforeCreate is a GORM lifecycle hook that runs before a new record is persisted.

If no ID is set manually, this ensures a UUID is generated for the primary key.
*/
func (u *URL) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = uuid.NewString()
	}
	return
}

