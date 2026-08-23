package main

import (
	"encoding/json"
	"log"
	"math"
	"net/http"
)

type calculationRequest struct {
	Operation string  `json:"operation"`
	Left      float64 `json:"left"`
	Right     float64 `json:"right"`
}

type calculationResponse struct {
	Result float64 `json:"result"`
	Error  string  `json:"error,omitempty"`
}

func main() {
	http.HandleFunc("/api/health", healthHandler)
	http.HandleFunc("/api/calculate", calculateHandler)
	log.Println("calculator API listening on http://localhost:8080")
	log.Fatal(http.ListenAndServe(":8080", withCORS(http.DefaultServeMux)))
}

func calculateHandler(response http.ResponseWriter, request *http.Request) {
	if request.Method != http.MethodPost {
		writeError(response, http.StatusMethodNotAllowed, "method not allowed")
		return
	}
	var input calculationRequest
	decoder := json.NewDecoder(request.Body)
	decoder.DisallowUnknownFields()
	if err := decoder.Decode(&input); err != nil || !finite(input.Left) || !finite(input.Right) {
		writeError(response, http.StatusBadRequest, "operation and finite numeric operands are required")
		return
	}

	var result float64
	switch input.Operation {
	case "add":
		result = input.Left + input.Right
	case "subtract":
		result = input.Left - input.Right
	case "multiply":
		result = input.Left * input.Right
	case "divide":
		if input.Right == 0 {
			writeError(response, http.StatusBadRequest, "division by zero is not allowed")
			return
		}
		result = input.Left / input.Right
	default:
		writeError(response, http.StatusBadRequest, "unsupported operation")
		return
	}
	writeJSON(response, http.StatusOK, calculationResponse{Result: result})
}

func healthHandler(response http.ResponseWriter, request *http.Request) {
	writeJSON(response, http.StatusOK, map[string]string{"status": "ok"})
}

func finite(value float64) bool {
	return !math.IsNaN(value) && !math.IsInf(value, 0)
}

func writeError(response http.ResponseWriter, status int, message string) {
	writeJSON(response, status, calculationResponse{Error: message})
}

func writeJSON(response http.ResponseWriter, status int, body any) {
	response.Header().Set("Content-Type", "application/json")
	response.WriteHeader(status)
	_ = json.NewEncoder(response).Encode(body)
}

func withCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(
		func(response http.ResponseWriter, request *http.Request) {
			response.Header().Set("Access-Control-Allow-Origin", "http://localhost:5173")
			response.Header().Set("Access-Control-Allow-Headers", "Content-Type")
			if request.Method == http.MethodOptions {
				response.WriteHeader(http.StatusNoContent)
				return
			}
			next.ServeHTTP(response, request)
		})
}
