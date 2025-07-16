// Package services contains core utility and business logic helpers,
// including functions for parsing, analyzing, and resolving URLs within pages.
package services

import (
	"net/url"
)

/*
extractHost returns only the hostname portion of a raw URL string.

Given input like "https://example.com/path?x=1", it returns "example.com".
If the input is invalid or cannot be parsed, an empty string is returned.
*/
func extractHost(rawURL string) string {
	parsed, err := url.Parse(rawURL)
	if err != nil {
		return ""
	}
	return parsed.Hostname()
}

/*
resolveURL converts a relative URL (href) into an absolute URL,
using baseStr as the base reference.
Returns the resolved absolute URL string. If either URL is invalid, the original href is returned unmodified.
*/
func resolveURL(baseStr, href string) string {
	base, err := url.Parse(baseStr)
	if err != nil {
		return href
	}
	ref, err := url.Parse(href)
	if err != nil {
		return href
	}
	return base.ResolveReference(ref).String()
}

