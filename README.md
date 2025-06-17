# J-O-E-Y Backend API

Backend service for processing JSON data and generating PDFs.

## Features

- `/submit` API endpoint for JSON data processing
- Automatic PDF generation from JSON data
- File storage with public URLs
- CORS enabled for frontend integration
- Health check endpoint

## Quick Start

1. Install dependencies:
```bash
npm install
```

2. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### POST /submit
Accepts JSON data, saves it as a file, and generates a PDF.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "data": {...}
}
```

**Response:**
```json
{
  "id": "uuid",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "files": {
    "json": {
      "filename": "data_2024-01-01T00-00-00-000Z_uuid.json",
      "url": "http://localhost:3000/files/data_2024-01-01T00-00-00-000Z_uuid.json"
    },
    "pdf": {
      "filename": "data_2024-01-01T00-00-00-000Z_uuid.pdf",
      "url": "http://localhost:3000/files/data_2024-01-01T00-00-00-000Z_uuid.pdf"
    }
  },
  "message": "Data processed successfully"
}
```

### GET /health
Health check endpoint.

## Deployment

The application is ready for deployment. Set the `PORT` environment variable as needed.

## File Structure

- `server.js` - Main application file
- `files/` - Storage directory for generated files
- Generated files are accessible via `/files/` route