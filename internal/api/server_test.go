package api

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestSignupRejectsNonCollegeEmail(t *testing.T) {
	server := NewServer()
	recorder := request(server, http.MethodPost, "/api/auth/signup", map[string]any{
		"name":  "Outsider",
		"email": "outsider@gmail.com",
	})

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected forbidden signup, got %d", recorder.Code)
	}
}

func TestSignupAcceptsAllowlistedCollegeEmail(t *testing.T) {
	server := NewServer()
	recorder := request(server, http.MethodPost, "/api/auth/signup", map[string]any{
		"name":   "Sneha",
		"email":  "sneha@sit.ac.in",
		"gender": "Woman",
	})

	if recorder.Code != http.StatusCreated {
		t.Fatalf("expected created signup, got %d: %s", recorder.Code, recorder.Body.String())
	}

	var student Student
	decode(t, recorder, &student)
	if !student.EmailVerified || student.College != "Siddaganga Institute of Technology" {
		t.Fatalf("unexpected signup payload: %+v", student)
	}
}

func TestUnverifiedDriverCannotCreateRide(t *testing.T) {
	server := NewServer()
	recorder := request(server, http.MethodPost, "/api/rides", map[string]any{
		"driverId": 2,
		"from":     "Jayanagar",
		"to":       "RVCE",
		"seats":    2,
	})

	if recorder.Code != http.StatusForbidden {
		t.Fatalf("expected forbidden ride creation, got %d", recorder.Code)
	}
}

func TestRequestAcceptTripCompleteUpdatesCarbon(t *testing.T) {
	server := NewServer()

	requestRecorder := request(server, http.MethodPost, "/api/ride-requests", map[string]any{
		"rideId":      1,
		"passengerId": 2,
		"seatCount":   1,
	})
	if requestRecorder.Code != http.StatusCreated {
		t.Fatalf("expected request created, got %d: %s", requestRecorder.Code, requestRecorder.Body.String())
	}
	var rideRequest RideRequest
	decode(t, requestRecorder, &rideRequest)

	acceptRecorder := request(server, http.MethodPost, "/api/ride-requests/1/accept", map[string]any{})
	if acceptRecorder.Code != http.StatusOK {
		t.Fatalf("expected accept ok, got %d: %s", acceptRecorder.Code, acceptRecorder.Body.String())
	}

	tripRecorder := request(server, http.MethodPost, "/api/trips/start", map[string]any{"requestId": rideRequest.ID})
	if tripRecorder.Code != http.StatusCreated {
		t.Fatalf("expected trip created, got %d: %s", tripRecorder.Code, tripRecorder.Body.String())
	}
	var trip Trip
	decode(t, tripRecorder, &trip)

	completeRecorder := request(server, http.MethodPost, "/api/trips/1/complete", map[string]any{})
	if completeRecorder.Code != http.StatusOK {
		t.Fatalf("expected trip completed, got %d: %s", completeRecorder.Code, completeRecorder.Body.String())
	}

	carbonRecorder := request(server, http.MethodGet, "/api/carbon?studentId=2", nil)
	if carbonRecorder.Code != http.StatusOK {
		t.Fatalf("expected carbon ok, got %d: %s", carbonRecorder.Code, carbonRecorder.Body.String())
	}
	var carbon map[string]any
	decode(t, carbonRecorder, &carbon)
	if carbon["monthlyKg"].(float64) <= 7.4 {
		t.Fatalf("expected monthly carbon to increase, got %+v after trip %+v", carbon, trip)
	}
}

func TestChatBlocksPhoneBeforeConfirmation(t *testing.T) {
	server := NewServer()
	request(server, http.MethodPost, "/api/ride-requests", map[string]any{
		"rideId":      1,
		"passengerId": 2,
		"seatCount":   1,
	})

	recorder := request(server, http.MethodPost, "/api/chat", map[string]any{
		"requestId": 1,
		"senderId":  2,
		"text":      "Call me on 9876543210",
	})

	if recorder.Code != http.StatusBadRequest {
		t.Fatalf("expected phone sharing to be blocked, got %d", recorder.Code)
	}
}

func request(server *Server, method, path string, body any) *httptest.ResponseRecorder {
	var reader *bytes.Reader
	if body == nil {
		reader = bytes.NewReader(nil)
	} else {
		payload, _ := json.Marshal(body)
		reader = bytes.NewReader(payload)
	}
	req := httptest.NewRequest(method, path, reader)
	if body != nil {
		req.Header.Set("Content-Type", "application/json")
	}
	recorder := httptest.NewRecorder()
	mux := http.NewServeMux()
	server.RegisterRoutes(mux)
	mux.ServeHTTP(recorder, req)
	return recorder
}

func decode(t *testing.T, recorder *httptest.ResponseRecorder, target any) {
	t.Helper()
	if err := json.Unmarshal(recorder.Body.Bytes(), target); err != nil {
		t.Fatalf("decode response: %v\n%s", err, recorder.Body.String())
	}
}
