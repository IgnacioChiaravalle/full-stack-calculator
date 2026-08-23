# Full-Stack Calculator

A full-stack calculator with a React + TypeScript frontend and a Go REST API. The frontend provides a focused calculator workspace, while the backend owns arithmetic execution and API-level validation.

## Prerequisites

- Node.js 20.19+ and npm
- Go 1.21+

## Setup

Install the frontend dependencies from the project root:

```bash
npm install
```

The backend uses only Go's standard library, so it does not require a separate dependency installation. Its module is located in `backend/`.

## Run Locally

Start the backend in one terminal:

```bash
cd backend
go run .
```

The API listens on `http://localhost:8080`.

Start the frontend from the project root in another terminal:

```bash
cd ..
npm run dev
```

The frontend is available at http://localhost:5173. Vite proxies requests from `/api` to the backend, so the browser does not need a separate API URL.

## Tests and Build

Run the frontend tests:

```bash
npm test
```

Run the frontend type check and production build:

```bash
npm run build
```

Run the backend tests:

```bash
cd backend
go test ./...
```

## REST API

### Health check

```bash
curl http://localhost:8080/api/health
```

Response:

```json
{"status":"ok"}
```

### Calculate

`POST /api/calculate` accepts JSON with an operation and two numeric operands:

```bash
curl -X POST http://localhost:8080/api/calculate \
	-H 'Content-Type: application/json' \
	-d '{"operation":"add","left":2,"right":3}'
```

Response:

```json
{"result":5}
```

Supported operations are `add`, `subtract`, `multiply`, and `divide`:

```bash
curl -X POST http://localhost:8080/api/calculate \
	-H 'Content-Type: application/json' \
	-d '{"operation":"divide","left":12,"right":3}'
```

```json
{"result":4}
```

Invalid JSON, non-numeric operands, unsupported operations, and division by zero return HTTP `400` with an error body. For example:

```bash
curl -X POST http://localhost:8080/api/calculate \
	-H 'Content-Type: application/json' \
	-d '{"operation":"divide","left":2,"right":0}'
```

```json
{"result":0,"error":"division by zero is not allowed"}
```

## Design Decisions and Assumptions

- Operations are performed with `float64` values, supporting decimal inputs and results.
- Division by zero and other issues with the inputs are rejected with an error instead of returning an infinity value.
- The frontend validates blank, non-numeric, and division-by-zero input before making a request. The backend repeats validation. This emulates a scenario where the contract between the two is loosely defined, as if they had been built independently, perhaps by different teams or organizations.
- A recent operations history panel was added to aid the user-friendliness of the application. The histoical data is held in frontend memory and limited to the five most recent successful calculations; it is not persisted across page reloads.
- The frontend is split into components, providing the scaffolding for a more extensible application. For simplicity's sake, the Calculator component is fairly self-contained, aside form the RecentWork component that accompanies it. The granularity of each component is deliberately limited to what was considered scope-appropriate.
- The frontend and backend test suites intentionally focus on the same arithmetic and division-by-zero behaviors. This helps compare the requirements of both sides under similar conditions.
