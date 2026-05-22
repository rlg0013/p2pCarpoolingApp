package api

import (
	"encoding/json"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"
)

type Server struct {
	mu       sync.Mutex
	rides    []Ride
	bookings []Booking
}

type Ride struct {
	ID              int      `json:"id"`
	DriverName      string   `json:"driverName"`
	College         string   `json:"college"`
	From            string   `json:"from"`
	To              string   `json:"to"`
	Date            string   `json:"date"`
	Time            string   `json:"time"`
	Seats           int      `json:"seats"`
	Price           int      `json:"price"`
	GenderPref      string   `json:"genderPref"`
	Vehicle         string   `json:"vehicle"`
	Rating          float64  `json:"rating"`
	Verified        bool     `json:"verified"`
	Tags            []string `json:"tags"`
	CarbonSavedKg   float64  `json:"carbonSavedKg"`
	Status          string   `json:"status"`
	MeetingPoint    string   `json:"meetingPoint"`
	EmergencyShared bool     `json:"emergencyShared"`
}

type Booking struct {
	ID        int    `json:"id"`
	RideID    int    `json:"rideId"`
	Student   string `json:"student"`
	College   string `json:"college"`
	Status    string `json:"status"`
	CreatedAt string `json:"createdAt"`
}

type Stats struct {
	ActiveRides     int     `json:"activeRides"`
	SeatsAvailable  int     `json:"seatsAvailable"`
	Bookings        int     `json:"bookings"`
	CarbonSavedKg   float64 `json:"carbonSavedKg"`
	VerifiedDrivers int     `json:"verifiedDrivers"`
}

func NewServer() *Server {
	return &Server{rides: seedRides()}
}

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/health", s.health)
	mux.HandleFunc("/api/rides", s.ridesHandler)
	mux.HandleFunc("/api/bookings", s.bookingsHandler)
	mux.HandleFunc("/api/stats", s.statsHandler)
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]string{"status": "ok", "service": "CampusPool Go API"})
}

func (s *Server) ridesHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.listRides(w, r)
	case http.MethodPost:
		s.createRide(w, r)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) listRides(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()

	query := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("q")))
	gender := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("gender")))
	college := strings.ToLower(strings.TrimSpace(r.URL.Query().Get("college")))

	var filtered []Ride
	for _, ride := range s.rides {
		if query != "" && !containsAny(ride, query) {
			continue
		}
		if gender != "" && strings.ToLower(ride.GenderPref) != gender {
			continue
		}
		if college != "" && !strings.Contains(strings.ToLower(ride.College), college) {
			continue
		}
		filtered = append(filtered, ride)
	}

	sort.Slice(filtered, func(i, j int) bool {
		return filtered[i].Time < filtered[j].Time
	})

	writeJSON(w, http.StatusOK, filtered)
}

func (s *Server) createRide(w http.ResponseWriter, r *http.Request) {
	var input Ride
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(input.From) == "" || strings.TrimSpace(input.To) == "" || input.Seats < 1 {
		http.Error(w, "from, to, and at least one seat are required", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	input.ID = len(s.rides) + 1
	input.Verified = true
	input.Status = "Open"
	input.Rating = 4.8
	input.CarbonSavedKg = float64(input.Seats) * 1.7
	if input.Tags == nil {
		input.Tags = []string{"New listing", "College ID required"}
	}
	s.rides = append(s.rides, input)

	writeJSON(w, http.StatusCreated, input)
}

func (s *Server) bookingsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input Booking
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if input.RideID == 0 {
		http.Error(w, "rideId is required", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.rides {
		if s.rides[i].ID == input.RideID {
			if s.rides[i].Seats == 0 {
				http.Error(w, "ride is full", http.StatusConflict)
				return
			}
			s.rides[i].Seats--
			input.ID = len(s.bookings) + 1
			input.Status = "Requested"
			input.CreatedAt = time.Now().Format(time.RFC3339)
			s.bookings = append(s.bookings, input)
			writeJSON(w, http.StatusCreated, input)
			return
		}
	}

	http.Error(w, "ride not found", http.StatusNotFound)
}

func (s *Server) statsHandler(w http.ResponseWriter, _ *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()

	stats := Stats{Bookings: len(s.bookings)}
	for _, ride := range s.rides {
		if ride.Status == "Open" {
			stats.ActiveRides++
		}
		stats.SeatsAvailable += ride.Seats
		stats.CarbonSavedKg += ride.CarbonSavedKg
		if ride.Verified {
			stats.VerifiedDrivers++
		}
	}

	writeJSON(w, http.StatusOK, stats)
}

func containsAny(ride Ride, query string) bool {
	values := []string{ride.DriverName, ride.College, ride.From, ride.To, ride.Vehicle, ride.MeetingPoint}
	for _, value := range values {
		if strings.Contains(strings.ToLower(value), query) {
			return true
		}
	}
	for _, tag := range ride.Tags {
		if strings.Contains(strings.ToLower(tag), query) {
			return true
		}
	}
	return false
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func seedRides() []Ride {
	return []Ride{
		{
			ID: 1, DriverName: "Aarav S", College: "RV College of Engineering", From: "Indiranagar Metro", To: "RVCE Mysore Road", Date: "2026-05-23", Time: "08:10", Seats: 3, Price: 85, GenderPref: "Any",
			Vehicle: "Hyundai i20", Rating: 4.9, Verified: true, Tags: []string{"Fast match", "UPI split", "College ID required"}, CarbonSavedKg: 5.1, Status: "Open", MeetingPoint: "Gate 2 metro exit", EmergencyShared: true,
		},
		{
			ID: 2, DriverName: "Nisha K", College: "Christ University", From: "Koramangala 5th Block", To: "Christ Central Campus", Date: "2026-05-23", Time: "07:45", Seats: 2, Price: 45, GenderPref: "Women only",
			Vehicle: "Honda Activa", Rating: 4.8, Verified: true, Tags: []string{"Women only", "Helmet available", "Live trip sharing"}, CarbonSavedKg: 2.4, Status: "Open", MeetingPoint: "Forum signal", EmergencyShared: true,
		},
		{
			ID: 3, DriverName: "Rahul M", College: "PES University", From: "BTM Layout", To: "PES RR Campus", Date: "2026-05-23", Time: "08:25", Seats: 4, Price: 70, GenderPref: "Any",
			Vehicle: "Maruti Swift", Rating: 4.7, Verified: true, Tags: []string{"Recurring", "Music okay", "No smoking"}, CarbonSavedKg: 6.8, Status: "Open", MeetingPoint: "BTM water tank", EmergencyShared: true,
		},
		{
			ID: 4, DriverName: "Meera P", College: "MS Ramaiah Institute of Technology", From: "Yeshwanthpur", To: "MSRIT Main Gate", Date: "2026-05-23", Time: "09:00", Seats: 1, Price: 35, GenderPref: "Women only",
			Vehicle: "TVS Jupiter", Rating: 4.9, Verified: true, Tags: []string{"Women only", "Short ride", "Verified route"}, CarbonSavedKg: 1.5, Status: "Open", MeetingPoint: "Yeshwanthpur metro", EmergencyShared: true,
		},
	}
}
