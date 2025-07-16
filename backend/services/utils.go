// Package services contains helper routines for URL transformation,
// HTML parsing, and content normalization used during analysis.
package services

import (
	"net/url"
	"strings"
)

/*
NormalizeURL standardizes a raw URL string into a consistent format.

It performs the following normalization steps:
  - Trims whitespace from the input
  - Adds a default "https" scheme if missing
  - Strips the "www." prefix from the host
  - Removes trailing slashes from the path

This ensures consistent comparisons and deduplication of similar URLs.
Returns the normalized URL string or an error if parsing fails.

Example:
	Input:  "http://www.example.com/"
	Output: "http://example.com"
*/
func NormalizeURL(raw string) (string, error) {
	u, err := url.Parse(strings.TrimSpace(raw))
	if err != nil {
		return "", err
	}

	if u.Scheme == "" {
		u.Scheme = "https"
	}

	u.Host = strings.TrimPrefix(u.Host, "www.")
	u.Path = strings.TrimRight(u.Path, "/")

	return u.String(), nil
}

