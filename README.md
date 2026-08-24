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
cd "/home/.../Calculator React App"
npm run dev
```

The frontend is available at http://localhost:5173.

## Tests and Build

Run the **frontend** tests:

```bash
npm test
```

Generate the **frontend** unit-test coverage report:

```bash
npm run test:coverage
```

This writes a coverage report to `coverage/`, including a terminal summary and an HTML report.

Run the **frontend** type check and production build:

```bash
npm run build
```

Run the **backend** tests:

```bash
cd backend
go test ./...
```

Generate the **backend** coverage report:

```bash
go test -coverprofile=coverage.out ./...
go tool cover -func=coverage.out
```

The first command records which **backend** statements were exercised. The second prints the coverage summary, including the total percentage.

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
- Division by zero and other issues with the inputs are rejected with an error instead of returning `infinity` as a value.
- The frontend validates blank, non-numeric, and division-by-zero input before making a request. The backend repeats validation. This emulates a scenario where the contract between the two is loosely defined, as if they had been built independently, perhaps by different teams or organizations.
- A recent operations history panel was added to enhance the user-friendliness of the application. The histoical data is held in frontend memory and limited to the five most recent successful calculations; it is not persisted across page reloads.
- The frontend is split into components, providing the scaffolding for a more extensible application. For simplicity's sake, the Calculator component is fairly self-contained, aside from the `RecentWork` component that accompanies it. The granularity of each component is deliberately limited to what was considered scope-appropriate.
- Styles (CSS code) are split with a bit more granularity than the rest of the code, making future UI/UX changes and fixes easy to implement. Each file has a meaningful name, representing either a section within the page or a clear role fulfilled by the file itself.
- The frontend and backend test suites intentionally focus on the same arithmetic and division-by-zero behaviors. This helps compare the requirements of both sides under similar conditions.
