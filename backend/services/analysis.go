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
	resp, err := http.Get(u.URL)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return errors.New("unreachable: " + resp.Status)
	}

	doc, err := html.Parse(resp.Body)
	if err != nil {
		return err
	}

	/* Initialize counters and flags used during tree traversal */
	headings := map[string]int{}
	linkCount := 0
	internal := 0
	external := 0
	inaccessible := 0
	hasLogin := false

	/* Recursive function that traverses the parsed HTML DOM tree
	   and collects metadata from relevant tags */
	var f func(*html.Node)
	f = func(n *html.Node) {
		if n.Type == html.ElementNode {
			switch strings.ToLower(n.Data) {
			case "h1", "h2", "h3", "h4", "h5", "h6":
				headings[n.Data]++

			case "a":
				for _, attr := range n.Attr {
					if attr.Key == "href" {
						linkCount++
						if strings.HasPrefix(attr.Val, "http") && !strings.HasPrefix(attr.Val, u.URL) {
							external++
						} else {
							internal++
						}
						// (Not implemented) Here you could try fetching each link to check accessibility
					}
				}

			case "input":
				for _, attr := range n.Attr {
					if attr.Key == "type" && attr.Val == "password" {
						hasLogin = true
					}
				}

			case "title":
				if n.FirstChild != nil {
					u.PageTitle = n.FirstChild.Data
				}
			}
		}

		// Recurse on children
		for c := n.FirstChild; c != nil; c = c.NextSibling {
			f(c)
		}
	}
	f(doc)

	/* Populate fields on the URL struct after analysis */
	u.HTMLVersion = detectHTMLVersion(resp.Proto)
	u.InternalLinksCount = internal
	u.ExternalLinksCount = external
	u.InaccessibleLinksCount = inaccessible
	u.HasLoginForm = hasLogin

	// Note: Heading totals can also be stored in the model if needed
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
