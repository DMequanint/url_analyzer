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
	InternalLinksCount     int       `json:"internalLinks"`                        // Number of internal links on page
	ExternalLinksCount     int       `json:"externalLinks"`                        // Number of external links
	InaccessibleLinksCount int       `json:"inaccessibleLinks"`                    // Links that failed to load
	HasLoginForm           bool      `json:"hasLoginForm"`                         // Presence of a login form
	H1                     int       `json:"h1"`                                   // Count of <h1> tags
	H2                     int       `json:"h2"`                                   // Count of <h2> tags
	H3                     int       `json:"h3"`                                   // Count of <h3> tags
	H4                     int       `json:"h4"`                                   // Count of <h4> tags
	H5                     int       `json:"h5"`                                   // Count of <h5> tags
	H6                     int       `json:"h6"`                                   // Count of <h6> tags
	ErrorReason            string    `json:"errorReason"`                          // If failed, reason string
	ErrorCode              int       `json:"errorCode"`                            // HTTP or custom error code (e.g. 408)
	Status                 string    `gorm:"index" json:"status"`                  // queued, running, done, error
	CreatedAt              time.Time `json:"created_at"`                           // Timestamp when URL was submitted
}

/*
BeforeCreate is a GORM lifecycle hook that runs before insertion.

Ensures every URL record gets a UUID assigned as ID.
*/
func (u *URL) BeforeCreate(tx *gorm.DB) (err error) {
	if u.ID == "" {
		u.ID = uuid.NewString()
	}
	return
}

