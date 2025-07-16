// Package services contains the core business logic of the application,
// including routines for parsing page content and analyzing metadata
// like links, headings, login form detection, and HTML version.
package services

import (
	"errors"
	"net/http"
	"strings"

	"github.com/DMequanint/url-analyzer-pro/models"
	"golang.org/x/net/html"
)

/*
AnalyzeURL performs a structured crawl of the given URL and populates
its analysis result into the provided *models.URL object.

The function sends an HTTP GET request to the target URL, and if successful:
  - Parses the HTML document
  - Counts heading tags (h1-h6)
  - Counts internal and external hyperlinks
  - Detects presence of a login form by checking for password input fields
  - Extracts the document title
  - Determines a basic HTML version based on the HTTP protocol

Returns an error if the URL is unreachable, HTTP fails, or parsing fails.
*/
func AnalyzeURL(u *models.URL) error {
	// Step 1: HTTP GET request
	resp, err := http.Get(u.URL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return errors.New("unreachable: " + resp.Status)
	}

	// Step 2: Parse HTML
	doc, err := html.Parse(resp.Body)
	if err != nil {
		return err
	}

	// Step 3: Initialize counters
	headings := map[string]int{}
	linkCount := 0
	internal := 0
	external := 0
	inaccessible := 0
	hasLogin := false

	// Step 4: Recursive DOM traversal
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode {
			tag := strings.ToLower(n.Data) // normalize tag name here

			switch tag {
			case "h1", "h2", "h3", "h4", "h5", "h6":
				headings[tag]++ // ✅ NOW SAFE — normalized to lowercase

			case "a":
				for _, attr := range n.Attr {
					if attr.Key == "href" {
						linkCount++
						href := attr.Val
						if strings.HasPrefix(href, "http") && !strings.HasPrefix(href, u.URL) {
							external++
						} else {
							internal++
						}
						// TODO: check if href is accessible and count `inaccessible`
					}
				}

			case "input":
				for _, attr := range n.Attr {
					if attr.Key == "type" && strings.ToLower(attr.Val) == "password" {
						hasLogin = true
					}
				}

			case "title":
				if n.FirstChild != nil && strings.TrimSpace(u.PageTitle) == "" {
					u.PageTitle = strings.TrimSpace(n.FirstChild.Data)
				}
			}
		}

		// Continue with sibling and child nodes
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	// Step 5: Assign analysis results
	u.HTMLVersion = detectHTMLVersion(resp.Proto)
	u.InternalLinksCount = internal
	u.ExternalLinksCount = external
	u.InaccessibleLinksCount = inaccessible
	u.HasLoginForm = hasLogin

	// ✅ Fixed: heading map keys now lowercase and consistent
	u.H1 = headings["h1"]
	u.H2 = headings["h2"]
	u.H3 = headings["h3"]
	u.H4 = headings["h4"]
	u.H5 = headings["h5"]
	u.H6 = headings["h6"]

	// ✅ Optional: Print to console for debug
	// fmt.Printf("Headings for %s → H1=%d, H2=%d, H3=%d, H4=%d, H5=%d, H6=%d\n",
	//	u.URL, u.H1, u.H2, u.H3, u.H4, u.H5, u.H6)

	return nil
}

/*
detectHTMLVersion returns a simplified indicator of HTML version
based on the HTTP protocol used by the server.

This is a placeholder and can be extended to extract DOCTYPE explicitly.
*/
func detectHTMLVersion(proto string) string {
	if strings.Contains(proto, "1.1") {
		return "HTML5"
	}
	return "Unknown"
}

