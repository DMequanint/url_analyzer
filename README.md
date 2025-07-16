# URL Analyzer

**URL Analyzer** is a full-stack application that allows users to submit and analyze webpages for SEO, accessibility, and structure metrics. It inspects hyperlinks, HTML versions, login forms, headings, and more.

Built with:

- **Backend:** Golang + Gin + GORM + WebSocket
- **Frontend:** React + TypeScript + Recharts
- **Database:** MySQL

---

## Features

- RESTful API for submitting URLs
- Scheduled or on-demand page analysis
- WebSocket support for real-time updates
- Dashboard UI for managing and viewing analysis
- Pie charts for link breakdowns
- Error and retry handling
- URL normalization for deduplication

---

## Technologies

| Layer        | Tools                                                    |
|--------------|----------------------------------------------------------|
| Backend      | Go (Gin, GORM, WebSocket), MySQL                         |
| Frontend     | React, TypeScript, React Router, Recharts                |
| Tooling      | ESLint, Prettier, Jest, React Testing Library, Go Test  |
| Configuration| `.env` files, static builds, optional Docker support     |

---

## Project Structure

url-analyzer/
├── backend/
│   ├── main.go
│   ├── models/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   └── websockethub/
│
├── frontend/
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── types/
│       └── App.tsx
│
├── .env.example
└── README.md

## Getting Started

### Prerequisites

Install the following:

- Go (1.20+): https://go.dev/doc/install
- Node.js + npm (18+): https://nodejs.org
- MySQL 8 or compatible

---

### Backend Setup (Go)

cd backend
cp .env.example .env
go mod tidy
go run main.go

Make sure `.env` contains valid values:

DB_HOST=127.0.0.1 - replace with the actual host IP address 
DB_PORT=3306
DB_USER=testuser
DB_PASSWORD=testuser
DB_NAME=url_analyzer_db
REACT_APP_API_BASE_URL=http://127.0.0.1:8080 (replace with actual IP address)
GIN_MODE=release

---

### Frontend Setup (React)

cd frontend
npm install
npm start


---

## Usage

1. Start both backend and frontend.
2. Open your browser at [http://localhost:3000](http://localhost:3000).
3. Submit a valid URL to trigger analysis.
4. View results in the table and detail view.
5. Use retry and re-analyze features for failed entries.

---

## Testing

### Backend (Go)
cd backend
go test ./...

### Frontend (React)

cd frontend
npm test

---

## API Overview

| Endpoint                        | Method | Description                    |
|--------------------------------|--------|--------------------------------|
| `/api/urls`                    | GET    | Get all URLs                   |
| `/api/urls/:id`                | GET    | Get specific URL data          |
| `/api/urls`                    | POST   | Submit new URL for analysis    |
| `/api/urls/:id/analyze`        | POST   | Queue URL for re-analysis      |
| `/api/urls/:id/retry`          | POST   | Retry failed analysis          |
| `/api/urls/:id`                | DELETE | Delete a URL and its results   |
| `/ws`                          | GET    | WebSocket endpoint for updates |

---

## Troubleshooting

| Problem                            | Solution |
|-----------------------------------|----------|
| Cannot connect to MySQL           | Ensure MySQL is running and credentials match `.env` |
| React API requests fail (CORS)    | Confirm backend is running and `REACT_APP_API_URL` is correct |
| WebSocket not connecting          | Ensure backend is running on correct port and `/ws` is accessible |
| Form submission fails             | Confirm URL format is valid and not a duplicate |
| Analysis never completes          | Check if worker is running and `ANALYZE_WORKER_COUNT` is greater than 0 |

---

## Production Build

### Frontend

cd frontend
npm run build

---

Serve the static content from a CDN or static file server.

### Backend

Use `go build` to compile and deploy the backend binary.


---

## Future Improvements

- Add user login and authentication (JWT or OAuth)
- Add support for PDF and CSV exports
- Detect more metadata (Open Graph, meta tags, etc.)
- Add unit tests for HTML parsing
- Dockerize with `docker-compose.yml` and `Dockerfile`

---

## License

This project is licensed under the [MIT License](LICENSE).

---


