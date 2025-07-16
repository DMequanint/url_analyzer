// Package websockethub manages connected WebSocket clients.
// It provides basic register/broadcast functionality to push updates
// from the server to all live WebSocket connections.
package websockethub

import (
	"encoding/json"
	"errors"
	"sync"
	"syscall"

	"github.com/gorilla/websocket"
)

var (
	// clients maps active WebSocket connections
	clients = make(map[*websocket.Conn]bool)

	// clientsMu synchronizes access to the clients map
	clientsMu = sync.Mutex{}
)

/*
Register adds a new WebSocket connection to the internal
hub of active clients. This ensures that the server can
push future events or updates to the registered connection.
*/
func Register(conn *websocket.Conn) {
	clientsMu.Lock()
	clients[conn] = true
	clientsMu.Unlock()
}

/*
BroadcastStatusUpdate sends a JSON-encoded status update
to all currently connected WebSocket clients.

If any client connection is closed or fails during
the broadcast, it is automatically removed from the hub.
*/
func BroadcastStatusUpdate(data interface{}) {
	// Encode the given payload into JSON
	msg, err := json.Marshal(data)
	if err != nil {
		// Skip sending if marshaling fails
		return
	}

	clientsMu.Lock()
	defer clientsMu.Unlock()

	for conn := range clients {
		// Attempt to write the message to the client
		err := conn.WriteMessage(websocket.TextMessage, msg)
		if err != nil {
			// Handle expected disconnects silently
			if websocket.IsUnexpectedCloseError(err) || errors.Is(err, syscall.EPIPE) {
				// Common client-side socket close error; cleanup
			} else {
				// Use logging for abnormal cases if needed
				// log.Printf("WebSocket write error: %v", err)
			}

			// Clean up: close socket and remove from clients map
			_ = conn.Close()
			delete(clients, conn)
		}
	}
}

