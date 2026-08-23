package main

import (
	"bytes"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestCalculateHandler(t *testing.T) {
	cases := []struct {
		name, body string
		status     int
		want       string
	}{
		{"addition", `{"operation":"add","left":2,"right":3}`, http.StatusOK, `"result":5`},
		{"subtraction", `{"operation":"subtract","left":8,"right":3}`, http.StatusOK, `"result":5`},
		{"multiplication", `{"operation":"multiply","left":4,"right":3}`, http.StatusOK, `"result":12`},
		{"division", `{"operation":"divide","left":12,"right":3}`, http.StatusOK, `"result":4`},
		{"zero addition", `{"operation":"add","left":0,"right":0}`, http.StatusOK, `"result":0`},
		{"zero subtraction", `{"operation":"subtract","left":0,"right":0}`, http.StatusOK, `"result":0`},
		{"zero multiplication", `{"operation":"multiply","left":7,"right":0}`, http.StatusOK, `"result":0`},
		{"division by zero", `{"operation":"divide","left":2,"right":0}`, http.StatusBadRequest, "division by zero"},
		{"unknown operation", `{"operation":"power","left":2,"right":3}`, http.StatusBadRequest, "unsupported operation"},
	}
	for _, testCase := range cases {
		t.Run(testCase.name, func(t *testing.T) {
			request := httptest.NewRequest(http.MethodPost, "/api/calculate", bytes.NewBufferString(testCase.body))
			response := httptest.NewRecorder()
			calculateHandler(response, request)
			if response.Code != testCase.status || !bytes.Contains(response.Body.Bytes(), []byte(testCase.want)) {
				t.Fatalf("got status %d and body %s", response.Code, response.Body.String())
			}
		})
	}
}
