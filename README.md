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
│ ├── main.go
│ ├── models/
│ ├── controllers/
│ ├── services/
│ ├── repositories/
│ └── websockethub/
├── frontend/
│ ├── src/
│ │ ├── components/
│ │ ├── pages/
│ │ ├── types/
│ │ └── App.tsx
├── .env.example
├── README.md

---

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

