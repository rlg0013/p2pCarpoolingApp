package api

import (
	"encoding/json"
	"fmt"
	"math"
	"net/http"
	"net/url"
	"sort"
	"strconv"
	"strings"
	"sync"
	"time"
)

const (
	statusPending   = "Pending"
	statusVerified  = "Verified"
	statusRejected  = "Rejected"
	requestPending  = "Requested"
	requestAccepted = "Accepted"
	requestRejected = "Rejected"
	requestWaitlist = "Waitlisted"
	tripActive      = "Active"
	tripCompleted   = "Completed"
)

type Server struct {
	mu            sync.Mutex
	students      []Student
	rides         []Ride
	requests      []RideRequest
	messages      []ChatMessage
	trips         []Trip
	payments      []Payment
	ratings       []Rating
	notifications []Notification
	waitlists     []WaitlistEntry
	hubs          []Hub
	domains       map[string]string
	next          Counters
}

type Counters struct {
	Student      int
	Ride         int
	Request      int
	Message      int
	Trip         int
	Payment      int
	Rating       int
	Notification int
	Waitlist     int
}

type Student struct {
	ID                 int              `json:"id"`
	Name               string           `json:"name"`
	Email              string           `json:"email"`
	College            string           `json:"college"`
	Gender             string           `json:"gender"`
	Phone              string           `json:"phone,omitempty"`
	EmailVerified      bool             `json:"emailVerified"`
	StudentID          Verification     `json:"studentId"`
	DriversLicense     Verification     `json:"driversLicense"`
	TrustedContacts    []TrustedContact `json:"trustedContacts"`
	RatingAsDriver     float64          `json:"ratingAsDriver"`
	RatingAsPassenger  float64          `json:"ratingAsPassenger"`
	TrustScore         int              `json:"trustScore"`
	PayLaterEligible   bool             `json:"payLaterEligible"`
	CO2SavedKg         float64          `json:"co2SavedKg"`
	MonthlyCO2SavedKg  float64          `json:"monthlyCo2SavedKg"`
	CompletedRideCount int              `json:"completedRideCount"`
	CreatedAt          string           `json:"createdAt"`
}

type Verification struct {
	Status       string `json:"status"`
	DocumentID   string `json:"documentId,omitempty"`
	UploadedAt   string `json:"uploadedAt,omitempty"`
	ReviewedAt   string `json:"reviewedAt,omitempty"`
	RejectReason string `json:"rejectReason,omitempty"`
}

type TrustedContact struct {
	Name  string `json:"name"`
	Phone string `json:"phone"`
}

type Ride struct {
	ID              int          `json:"id"`
	DriverID        int          `json:"driverId"`
	DriverName      string       `json:"driverName"`
	College         string       `json:"college"`
	From            string       `json:"from"`
	To              string       `json:"to"`
	Route           []RoutePoint `json:"route"`
	RouteSummary    string       `json:"routeSummary"`
	Date            string       `json:"date"`
	Time            string       `json:"time"`
	Recurring       Recurring    `json:"recurring"`
	Seats           int          `json:"seats"`
	AvailableSeats  int          `json:"availableSeats"`
	DistanceKm      float64      `json:"distanceKm"`
	FuelCostPerKm   float64      `json:"fuelCostPerKm"`
	Price           int          `json:"price"`
	AutoFare        FareQuote    `json:"autoFare"`
	GenderPref      string       `json:"genderPref"`
	Vehicle         string       `json:"vehicle"`
	Rating          float64      `json:"rating"`
	Verified        bool         `json:"verified"`
	Tags            []string     `json:"tags"`
	CarbonSavedKg   float64      `json:"carbonSavedKg"`
	Status          string       `json:"status"`
	MeetingPoint    string       `json:"meetingPoint"`
	EmergencyShared bool         `json:"emergencyShared"`
	HubID           int          `json:"hubId,omitempty"`
	CreatedAt       string       `json:"createdAt"`
}

type RoutePoint struct {
	Name string  `json:"name"`
	Lat  float64 `json:"lat"`
	Lng  float64 `json:"lng"`
}

type Recurring struct {
	Enabled bool     `json:"enabled"`
	Days    []string `json:"days,omitempty"`
	Until   string   `json:"until,omitempty"`
}

type FareQuote struct {
	DistanceKm      float64 `json:"distanceKm"`
	FuelCostPerKm   float64 `json:"fuelCostPerKm"`
	Seats           int     `json:"seats"`
	PlatformFee     int     `json:"platformFee"`
	RecommendedFare int     `json:"recommendedFare"`
	Formula         string  `json:"formula"`
}

type RideRequest struct {
	ID           int     `json:"id"`
	RideID       int     `json:"rideId"`
	PassengerID  int     `json:"passengerId"`
	Student      string  `json:"student"`
	College      string  `json:"college"`
	Status       string  `json:"status"`
	Message      string  `json:"message"`
	SeatCount    int     `json:"seatCount"`
	Fare         int     `json:"fare"`
	OverlapScore float64 `json:"overlapScore"`
	CreatedAt    string  `json:"createdAt"`
	UpdatedAt    string  `json:"updatedAt"`
}

type ChatMessage struct {
	ID        int    `json:"id"`
	RequestID int    `json:"requestId"`
	SenderID  int    `json:"senderId"`
	Text      string `json:"text"`
	CreatedAt string `json:"createdAt"`
	Visible   bool   `json:"visible"`
}

type Trip struct {
	ID                    int              `json:"id"`
	RideID                int              `json:"rideId"`
	RequestID             int              `json:"requestId"`
	DriverID              int              `json:"driverId"`
	PassengerIDs          []int            `json:"passengerIds"`
	Status                string           `json:"status"`
	StartedAt             string           `json:"startedAt"`
	CompletedAt           string           `json:"completedAt,omitempty"`
	LiveLocations         []LiveLocation   `json:"liveLocations"`
	TrustedContactsShared []TrustedContact `json:"trustedContactsShared"`
	SOS                   []SOSEvent       `json:"sos"`
}

type LiveLocation struct {
	StudentID int     `json:"studentId"`
	Lat       float64 `json:"lat"`
	Lng       float64 `json:"lng"`
	SpeedKph  float64 `json:"speedKph"`
	At        string  `json:"at"`
}

type SOSEvent struct {
	StudentID int    `json:"studentId"`
	Message   string `json:"message"`
	At        string `json:"at"`
}

type Payment struct {
	ID          int    `json:"id"`
	RequestID   int    `json:"requestId"`
	PayerID     int    `json:"payerId"`
	ReceiverID  int    `json:"receiverId"`
	Amount      int    `json:"amount"`
	Method      string `json:"method"`
	Status      string `json:"status"`
	UPILink     string `json:"upiLink"`
	PayLater    bool   `json:"payLater"`
	RequestedAt string `json:"requestedAt"`
	PaidAt      string `json:"paidAt,omitempty"`
}

type Rating struct {
	ID        int    `json:"id"`
	RideID    int    `json:"rideId"`
	FromID    int    `json:"fromId"`
	ToID      int    `json:"toId"`
	Role      string `json:"role"`
	Score     int    `json:"score"`
	Comment   string `json:"comment"`
	CreatedAt string `json:"createdAt"`
}

type Notification struct {
	ID        int    `json:"id"`
	StudentID int    `json:"studentId"`
	Type      string `json:"type"`
	Title     string `json:"title"`
	Body      string `json:"body"`
	Read      bool   `json:"read"`
	CreatedAt string `json:"createdAt"`
}

type WaitlistEntry struct {
	ID          int    `json:"id"`
	RideID      int    `json:"rideId"`
	StudentID   int    `json:"studentId"`
	Route       string `json:"route"`
	College     string `json:"college"`
	Status      string `json:"status"`
	Position    int    `json:"position"`
	RequestedAt string `json:"requestedAt"`
}

type Hub struct {
	ID          int        `json:"id"`
	Name        string     `json:"name"`
	College     string     `json:"college"`
	Area        string     `json:"area"`
	Coordinates RoutePoint `json:"coordinates"`
	PopularFor  []string   `json:"popularFor"`
}

type MatchResult struct {
	Ride          Ride    `json:"ride"`
	OverlapScore  float64 `json:"overlapScore"`
	MatchedPoints int     `json:"matchedPoints"`
	Reason        string  `json:"reason"`
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
	ActiveRides       int     `json:"activeRides"`
	SeatsAvailable    int     `json:"seatsAvailable"`
	Bookings          int     `json:"bookings"`
	CarbonSavedKg     float64 `json:"carbonSavedKg"`
	VerifiedDrivers   int     `json:"verifiedDrivers"`
	Students          int     `json:"students"`
	PendingRequests   int     `json:"pendingRequests"`
	ActiveTrips       int     `json:"activeTrips"`
	OpenWaitlist      int     `json:"openWaitlist"`
	Notifications     int     `json:"notifications"`
	PaymentsPending   int     `json:"paymentsPending"`
	MonthlyCO2SavedKg float64 `json:"monthlyCo2SavedKg"`
}

func NewServer() *Server {
	students := seedStudents()
	rides := seedRides()
	return &Server{
		students: students,
		rides:    rides,
		hubs:     seedHubs(),
		domains: map[string]string{
			"sit.ac.in":           "Siddaganga Institute of Technology",
			"rvce.edu.in":         "RV College of Engineering",
			"christuniversity.in": "Christ University",
			"pes.edu":             "PES University",
			"msrit.edu":           "MS Ramaiah Institute of Technology",
			"bmsce.ac.in":         "BMS College of Engineering",
			"dsu.edu.in":          "Dayananda Sagar University",
		},
		next: Counters{
			Student:      len(students) + 1,
			Ride:         len(rides) + 1,
			Request:      1,
			Message:      1,
			Trip:         1,
			Payment:      1,
			Rating:       1,
			Notification: 1,
			Waitlist:     1,
		},
	}
}

func (s *Server) RegisterRoutes(mux *http.ServeMux) {
	mux.HandleFunc("/api/health", s.health)
	mux.HandleFunc("/api/stats", s.statsHandler)
	mux.HandleFunc("/api/auth/signup", s.signupHandler)
	mux.HandleFunc("/api/auth/login", s.loginHandler)
	mux.HandleFunc("/api/students", s.studentsHandler)
	mux.HandleFunc("/api/verifications/student-id", s.studentIDHandler)
	mux.HandleFunc("/api/verifications/license", s.licenseHandler)
	mux.HandleFunc("/api/hubs", s.hubsHandler)
	mux.HandleFunc("/api/rides", s.ridesHandler)
	mux.HandleFunc("/api/matches", s.matchesHandler)
	mux.HandleFunc("/api/bookings", s.legacyBookingHandler)
	mux.HandleFunc("/api/ride-requests", s.rideRequestsHandler)
	mux.HandleFunc("/api/ride-requests/", s.rideRequestActionHandler)
	mux.HandleFunc("/api/chat", s.chatHandler)
	mux.HandleFunc("/api/trips/start", s.startTripHandler)
	mux.HandleFunc("/api/trips/", s.tripActionHandler)
	mux.HandleFunc("/api/payments/calculate", s.fareHandler)
	mux.HandleFunc("/api/payments", s.paymentsHandler)
	mux.HandleFunc("/api/ratings", s.ratingsHandler)
	mux.HandleFunc("/api/history", s.historyHandler)
	mux.HandleFunc("/api/notifications", s.notificationsHandler)
	mux.HandleFunc("/api/waitlists", s.waitlistsHandler)
	mux.HandleFunc("/api/carbon", s.carbonHandler)
}

func (s *Server) health(w http.ResponseWriter, _ *http.Request) {
	writeJSON(w, http.StatusOK, map[string]any{
		"status":  "ok",
		"service": "CampusPool Go API",
		"features": []string{
			"college email auth", "student ID verification", "license verification", "route matching",
			"recurring rides", "ride requests", "chat", "live location", "fare split", "UPI",
			"ratings", "SOS", "history", "notifications", "waitlist", "carbon tracker",
		},
	})
}

func (s *Server) statsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	stats := Stats{
		Students:      len(s.students),
		Bookings:      len(s.requests),
		Notifications: len(s.notifications),
	}
	for _, ride := range s.rides {
		if ride.Status == "Open" {
			stats.ActiveRides++
		}
		stats.SeatsAvailable += ride.AvailableSeats
		stats.CarbonSavedKg += ride.CarbonSavedKg
		if ride.Verified {
			stats.VerifiedDrivers++
		}
	}
	for _, request := range s.requests {
		if request.Status == requestPending {
			stats.PendingRequests++
		}
	}
	for _, trip := range s.trips {
		if trip.Status == tripActive {
			stats.ActiveTrips++
		}
	}
	for _, waitlist := range s.waitlists {
		if waitlist.Status == requestWaitlist {
			stats.OpenWaitlist++
		}
	}
	for _, payment := range s.payments {
		if payment.Status == "Pending" || payment.Status == "PayLater" {
			stats.PaymentsPending++
		}
	}
	for _, student := range s.students {
		stats.MonthlyCO2SavedKg += student.MonthlyCO2SavedKg
	}

	stats.CarbonSavedKg = round(stats.CarbonSavedKg)
	stats.MonthlyCO2SavedKg = round(stats.MonthlyCO2SavedKg)
	writeJSON(w, http.StatusOK, stats)
}

func (s *Server) signupHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input Student
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	domain, err := emailDomain(input.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	college, ok := s.domains[domain]
	if !ok {
		http.Error(w, "college email domain is not allowlisted", http.StatusForbidden)
		return
	}
	for _, student := range s.students {
		if strings.EqualFold(student.Email, input.Email) {
			http.Error(w, "student already exists", http.StatusConflict)
			return
		}
	}

	input.ID = s.next.Student
	s.next.Student++
	input.College = college
	input.EmailVerified = true
	input.StudentID = Verification{Status: statusPending}
	input.DriversLicense = Verification{Status: statusPending}
	input.TrustScore = 55
	input.RatingAsDriver = 0
	input.RatingAsPassenger = 0
	input.PayLaterEligible = false
	input.CreatedAt = now()
	if len(input.TrustedContacts) == 0 {
		input.TrustedContacts = []TrustedContact{{Name: "Campus Security", Phone: "100"}}
	}
	s.students = append(s.students, input)
	s.notify(input.ID, "auth", "College email verified", "Your account is limited to verified college-only rides.")
	writeJSON(w, http.StatusCreated, input)
}

func (s *Server) loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}

	var input struct {
		Email string `json:"email"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	domain, err := emailDomain(input.Email)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	if _, ok := s.domains[domain]; !ok {
		http.Error(w, "college email domain is not allowlisted", http.StatusForbidden)
		return
	}
	for _, student := range s.students {
		if strings.EqualFold(student.Email, input.Email) {
			s.notify(student.ID, "auth", "Signed in", "Welcome back to CampusPool.")
			writeJSON(w, http.StatusOK, student)
			return
		}
	}

	http.Error(w, "student not found; sign up first", http.StatusNotFound)
}

func (s *Server) studentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, s.students)
}

func (s *Server) studentIDHandler(w http.ResponseWriter, r *http.Request) {
	s.handleVerification(w, r, "student-id")
}

func (s *Server) licenseHandler(w http.ResponseWriter, r *http.Request) {
	s.handleVerification(w, r, "license")
}

func (s *Server) handleVerification(w http.ResponseWriter, r *http.Request, kind string) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input struct {
		StudentID  int    `json:"studentId"`
		DocumentID string `json:"documentId"`
		Approve    bool   `json:"approve"`
		Reason     string `json:"reason"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if input.StudentID == 0 || strings.TrimSpace(input.DocumentID) == "" {
		http.Error(w, "studentId and documentId are required", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	student, index := s.findStudent(input.StudentID)
	if student == nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}

	verification := Verification{
		Status:     statusVerified,
		DocumentID: input.DocumentID,
		UploadedAt: now(),
		ReviewedAt: now(),
	}
	if !input.Approve {
		verification.Status = statusRejected
		verification.RejectReason = defaultString(input.Reason, "Manual review rejected the document")
	}

	if kind == "student-id" {
		s.students[index].StudentID = verification
	} else {
		s.students[index].DriversLicense = verification
	}
	s.recalculateTrust(index)
	s.notify(input.StudentID, "verification", strings.Title(kind)+" verification updated", "Your trust score is now "+strconv.Itoa(s.students[index].TrustScore)+".")
	writeJSON(w, http.StatusOK, s.students[index])
}

func (s *Server) hubsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	s.mu.Lock()
	defer s.mu.Unlock()
	writeJSON(w, http.StatusOK, s.hubs)
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
	studentID := intQuery(r, "studentId")

	var filtered []Ride
	for _, ride := range s.rides {
		if query != "" && !containsAny(ride, query) {
			continue
		}
		if gender != "" && gender != "all" && strings.ToLower(ride.GenderPref) != gender {
			continue
		}
		if college != "" && !strings.Contains(strings.ToLower(ride.College), college) {
			continue
		}
		if studentID > 0 && !s.genderAllowed(studentID, ride) {
			continue
		}
		filtered = append(filtered, ride)
	}

	sort.Slice(filtered, func(i, j int) bool {
		if filtered[i].Date == filtered[j].Date {
			return filtered[i].Time < filtered[j].Time
		}
		return filtered[i].Date < filtered[j].Date
	})

	writeJSON(w, http.StatusOK, filtered)
}

func (s *Server) createRide(w http.ResponseWriter, r *http.Request) {
	var input Ride
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if strings.TrimSpace(input.From) == "" || strings.TrimSpace(input.To) == "" || input.Seats < 1 || input.DriverID == 0 {
		http.Error(w, "driverId, from, to, and at least one seat are required", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	driver, _ := s.findStudent(input.DriverID)
	if driver == nil {
		http.Error(w, "driver not found", http.StatusNotFound)
		return
	}
	if !driver.EmailVerified || driver.StudentID.Status != statusVerified || driver.DriversLicense.Status != statusVerified {
		http.Error(w, "driver must have college email, student ID, and license verified", http.StatusForbidden)
		return
	}

	input.ID = s.next.Ride
	s.next.Ride++
	input.DriverName = defaultString(input.DriverName, driver.Name)
	input.College = defaultString(input.College, driver.College)
	input.AvailableSeats = input.Seats
	input.Verified = true
	input.Status = "Open"
	input.Rating = driver.RatingAsDriver
	input.CreatedAt = now()
	if input.Route == nil || len(input.Route) < 2 {
		input.Route = routeFromNames(input.From, input.To)
	}
	input.RouteSummary = routeSummary(input.Route)
	if input.DistanceKm == 0 {
		input.DistanceKm = estimateDistance(input.Route)
	}
	if input.FuelCostPerKm == 0 {
		input.FuelCostPerKm = 8.5
	}
	input.AutoFare = calculateFare(input.DistanceKm, input.FuelCostPerKm, input.Seats)
	if input.Price == 0 {
		input.Price = input.AutoFare.RecommendedFare
	}
	input.CarbonSavedKg = calculateCarbon(input.DistanceKm, input.Seats)
	if input.Tags == nil {
		input.Tags = []string{"College ID required", "UPI split", "Live trip sharing"}
	}
	s.rides = append(s.rides, input)
	s.notifyMatchingStudents(input)

	writeJSON(w, http.StatusCreated, input)
}

func (s *Server) matchesHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input struct {
		StudentID int          `json:"studentId"`
		From      string       `json:"from"`
		To        string       `json:"to"`
		Route     []RoutePoint `json:"route"`
		College   string       `json:"college"`
		Gender    string       `json:"gender"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if len(input.Route) < 2 {
		input.Route = routeFromNames(input.From, input.To)
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	var matches []MatchResult
	for _, ride := range s.rides {
		if ride.Status != "Open" || ride.AvailableSeats == 0 {
			continue
		}
		if input.College != "" && !strings.EqualFold(input.College, ride.College) {
			continue
		}
		if input.StudentID > 0 && !s.genderAllowed(input.StudentID, ride) {
			continue
		}
		score, points := routeOverlap(input.Route, ride.Route)
		if score >= 0.34 || stringOverlap(input.From, ride.From) || stringOverlap(input.To, ride.To) {
			matches = append(matches, MatchResult{
				Ride:          ride,
				OverlapScore:  round(score),
				MatchedPoints: points,
				Reason:        matchReason(score, ride),
			})
		}
	}
	sort.Slice(matches, func(i, j int) bool {
		return matches[i].OverlapScore > matches[j].OverlapScore
	})
	writeJSON(w, http.StatusOK, matches)
}

func (s *Server) legacyBookingHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input Booking
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	passengerID := 2
	if input.Student != "" {
		passengerID = s.studentIDByName(input.Student)
	}
	s.createRideRequest(w, RideRequest{
		RideID:      input.RideID,
		PassengerID: passengerID,
		Student:     defaultString(input.Student, "Demo Student"),
		College:     defaultString(input.College, "RV College of Engineering"),
		SeatCount:   1,
		Message:     "Legacy booking request from prototype UI",
	})
}

func (s *Server) rideRequestsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.listRideRequests(w, r)
	case http.MethodPost:
		var input RideRequest
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		s.createRideRequest(w, input)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) createRideRequest(w http.ResponseWriter, input RideRequest) {
	if input.RideID == 0 || input.PassengerID == 0 {
		http.Error(w, "rideId and passengerId are required", http.StatusBadRequest)
		return
	}
	if input.SeatCount == 0 {
		input.SeatCount = 1
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	ride, rideIndex := s.findRide(input.RideID)
	passenger, _ := s.findStudent(input.PassengerID)
	if ride == nil {
		http.Error(w, "ride not found", http.StatusNotFound)
		return
	}
	if passenger == nil {
		http.Error(w, "passenger not found", http.StatusNotFound)
		return
	}
	if !passenger.EmailVerified || passenger.StudentID.Status != statusVerified {
		http.Error(w, "passenger must verify college email and student ID", http.StatusForbidden)
		return
	}
	if !s.genderAllowed(input.PassengerID, *ride) {
		http.Error(w, "ride gender preference does not allow this passenger", http.StatusForbidden)
		return
	}
	if ride.AvailableSeats < input.SeatCount {
		entry := s.addWaitlistLocked(ride.ID, passenger.ID, ride.From+" to "+ride.To, passenger.College)
		writeJSON(w, http.StatusAccepted, entry)
		return
	}

	score, _ := routeOverlap(routeFromNames(ride.From, ride.To), ride.Route)
	input.ID = s.next.Request
	s.next.Request++
	input.Student = passenger.Name
	input.College = passenger.College
	input.Status = requestPending
	input.Fare = ride.Price * input.SeatCount
	input.OverlapScore = round(score)
	input.CreatedAt = now()
	input.UpdatedAt = input.CreatedAt
	s.requests = append(s.requests, input)
	s.rides[rideIndex].AvailableSeats -= input.SeatCount
	s.notify(ride.DriverID, "ride-request", "New ride request", passenger.Name+" requested a seat from "+ride.From+" to "+ride.To+".")
	s.notify(passenger.ID, "ride-request", "Request sent", "The driver can chat before accepting your ride.")

	writeJSON(w, http.StatusCreated, input)
}

func (s *Server) listRideRequests(w http.ResponseWriter, r *http.Request) {
	s.mu.Lock()
	defer s.mu.Unlock()
	studentID := intQuery(r, "studentId")
	rideID := intQuery(r, "rideId")
	var results []RideRequest
	for _, request := range s.requests {
		if studentID > 0 && request.PassengerID != studentID {
			ride, _ := s.findRide(request.RideID)
			if ride == nil || ride.DriverID != studentID {
				continue
			}
		}
		if rideID > 0 && request.RideID != rideID {
			continue
		}
		results = append(results, request)
	}
	writeJSON(w, http.StatusOK, results)
}

func (s *Server) rideRequestActionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id, action, ok := parseIDAction(r.URL.Path, "/api/ride-requests/")
	if !ok {
		http.Error(w, "expected /api/ride-requests/{id}/{accept|reject|cancel}", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.requests {
		if s.requests[i].ID != id {
			continue
		}
		switch action {
		case "accept":
			s.requests[i].Status = requestAccepted
		case "reject", "cancel":
			s.requests[i].Status = requestRejected
			if ride, rideIndex := s.findRide(s.requests[i].RideID); ride != nil {
				s.rides[rideIndex].AvailableSeats += s.requests[i].SeatCount
				s.promoteWaitlistLocked(*ride)
			}
		default:
			http.Error(w, "unsupported request action", http.StatusBadRequest)
			return
		}
		s.requests[i].UpdatedAt = now()
		s.notify(s.requests[i].PassengerID, "ride-request", "Ride request "+strings.ToLower(s.requests[i].Status), "Your request status changed.")
		writeJSON(w, http.StatusOK, s.requests[i])
		return
	}
	http.Error(w, "ride request not found", http.StatusNotFound)
}

func (s *Server) chatHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		requestID := intQuery(r, "requestId")
		var results []ChatMessage
		for _, message := range s.messages {
			if requestID == 0 || message.RequestID == requestID {
				results = append(results, message)
			}
		}
		writeJSON(w, http.StatusOK, results)
	case http.MethodPost:
		var input ChatMessage
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if input.RequestID == 0 || input.SenderID == 0 || strings.TrimSpace(input.Text) == "" {
			http.Error(w, "requestId, senderId, and text are required", http.StatusBadRequest)
			return
		}
		if containsPhoneNumber(input.Text) {
			http.Error(w, "phone numbers are hidden until a ride is accepted", http.StatusBadRequest)
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		if s.findRequest(input.RequestID) == nil {
			http.Error(w, "request not found", http.StatusNotFound)
			return
		}
		input.ID = s.next.Message
		s.next.Message++
		input.Visible = true
		input.CreatedAt = now()
		s.messages = append(s.messages, input)
		writeJSON(w, http.StatusCreated, input)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) startTripHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input struct {
		RequestID int `json:"requestId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	request := s.findRequest(input.RequestID)
	if request == nil || request.Status != requestAccepted {
		http.Error(w, "accepted request required to start trip", http.StatusBadRequest)
		return
	}
	ride, _ := s.findRide(request.RideID)
	if ride == nil {
		http.Error(w, "ride not found", http.StatusNotFound)
		return
	}
	passenger, _ := s.findStudent(request.PassengerID)
	contacts := []TrustedContact{}
	if passenger != nil {
		contacts = append(contacts, passenger.TrustedContacts...)
	}
	trip := Trip{
		ID:                    s.next.Trip,
		RideID:                ride.ID,
		RequestID:             request.ID,
		DriverID:              ride.DriverID,
		PassengerIDs:          []int{request.PassengerID},
		Status:                tripActive,
		StartedAt:             now(),
		TrustedContactsShared: contacts,
	}
	s.next.Trip++
	s.trips = append(s.trips, trip)
	s.notify(request.PassengerID, "trip", "Live trip started", "Trusted contacts received the trip link.")
	s.notify(ride.DriverID, "trip", "Trip started", "Live location sharing is active.")
	writeJSON(w, http.StatusCreated, trip)
}

func (s *Server) tripActionHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	id, action, ok := parseIDAction(r.URL.Path, "/api/trips/")
	if !ok {
		http.Error(w, "expected /api/trips/{id}/{location|sos|complete}", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	for i := range s.trips {
		if s.trips[i].ID != id {
			continue
		}
		switch action {
		case "location":
			var input LiveLocation
			if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
				http.Error(w, "invalid JSON", http.StatusBadRequest)
				return
			}
			input.At = now()
			s.trips[i].LiveLocations = append(s.trips[i].LiveLocations, input)
		case "sos":
			var input SOSEvent
			if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
				http.Error(w, "invalid JSON", http.StatusBadRequest)
				return
			}
			input.At = now()
			s.trips[i].SOS = append(s.trips[i].SOS, input)
			s.notify(s.trips[i].DriverID, "sos", "SOS triggered", defaultString(input.Message, "A rider triggered SOS during the trip."))
		case "complete":
			s.trips[i].Status = tripCompleted
			s.trips[i].CompletedAt = now()
			s.applyCarbonForTripLocked(s.trips[i])
		default:
			http.Error(w, "unsupported trip action", http.StatusBadRequest)
			return
		}
		writeJSON(w, http.StatusOK, s.trips[i])
		return
	}
	http.Error(w, "trip not found", http.StatusNotFound)
}

func (s *Server) fareHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input struct {
		DistanceKm    float64 `json:"distanceKm"`
		FuelCostPerKm float64 `json:"fuelCostPerKm"`
		Seats         int     `json:"seats"`
	}
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	writeJSON(w, http.StatusOK, calculateFare(input.DistanceKm, input.FuelCostPerKm, input.Seats))
}

func (s *Server) paymentsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input Payment
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if input.RequestID == 0 || input.PayerID == 0 || input.ReceiverID == 0 {
		http.Error(w, "requestId, payerId, and receiverId are required", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	request := s.findRequest(input.RequestID)
	payer, _ := s.findStudent(input.PayerID)
	receiver, _ := s.findStudent(input.ReceiverID)
	if request == nil || payer == nil || receiver == nil {
		http.Error(w, "request, payer, or receiver not found", http.StatusNotFound)
		return
	}
	if input.PayLater && !payer.PayLaterEligible {
		http.Error(w, "payer is not eligible for pay later", http.StatusForbidden)
		return
	}
	input.ID = s.next.Payment
	s.next.Payment++
	input.Amount = defaultInt(input.Amount, request.Fare)
	input.Method = defaultString(input.Method, "UPI")
	input.Status = "Pending"
	if input.PayLater {
		input.Status = "PayLater"
	}
	input.RequestedAt = now()
	input.UPILink = buildUPILink(receiver.Name, "campuspool@upi", input.Amount)
	s.payments = append(s.payments, input)
	s.notify(receiver.ID, "payment", "Payment requested", payer.Name+" generated a payment for Rs "+strconv.Itoa(input.Amount)+".")
	writeJSON(w, http.StatusCreated, input)
}

func (s *Server) ratingsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	var input Rating
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		http.Error(w, "invalid JSON", http.StatusBadRequest)
		return
	}
	if input.RideID == 0 || input.FromID == 0 || input.ToID == 0 || input.Score < 1 || input.Score > 5 {
		http.Error(w, "rideId, fromId, toId, and score 1-5 are required", http.StatusBadRequest)
		return
	}

	s.mu.Lock()
	defer s.mu.Unlock()

	input.ID = s.next.Rating
	s.next.Rating++
	input.CreatedAt = now()
	s.ratings = append(s.ratings, input)
	s.updateRatingLocked(input.ToID, input.Role)
	s.notify(input.ToID, "rating", "New "+input.Role+" rating", "You received "+strconv.Itoa(input.Score)+" stars.")
	writeJSON(w, http.StatusCreated, input)
}

func (s *Server) historyHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	studentID := intQuery(r, "studentId")
	s.mu.Lock()
	defer s.mu.Unlock()

	var results []map[string]any
	for _, request := range s.requests {
		ride, _ := s.findRide(request.RideID)
		if ride == nil {
			continue
		}
		if studentID == 0 || request.PassengerID == studentID || ride.DriverID == studentID {
			results = append(results, map[string]any{
				"request": request,
				"ride":    ride,
				"role":    roleFor(studentID, request, *ride),
			})
		}
	}
	writeJSON(w, http.StatusOK, results)
}

func (s *Server) notificationsHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	studentID := intQuery(r, "studentId")
	s.mu.Lock()
	defer s.mu.Unlock()
	var results []Notification
	for _, notification := range s.notifications {
		if studentID == 0 || notification.StudentID == studentID {
			results = append(results, notification)
		}
	}
	sort.Slice(results, func(i, j int) bool { return results[i].CreatedAt > results[j].CreatedAt })
	writeJSON(w, http.StatusOK, results)
}

func (s *Server) waitlistsHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		s.mu.Lock()
		defer s.mu.Unlock()
		writeJSON(w, http.StatusOK, s.waitlists)
	case http.MethodPost:
		var input WaitlistEntry
		if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
			http.Error(w, "invalid JSON", http.StatusBadRequest)
			return
		}
		if input.RideID == 0 || input.StudentID == 0 {
			http.Error(w, "rideId and studentId are required", http.StatusBadRequest)
			return
		}
		s.mu.Lock()
		defer s.mu.Unlock()
		entry := s.addWaitlistLocked(input.RideID, input.StudentID, input.Route, input.College)
		writeJSON(w, http.StatusCreated, entry)
	default:
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
	}
}

func (s *Server) carbonHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	studentID := intQuery(r, "studentId")
	s.mu.Lock()
	defer s.mu.Unlock()
	student, _ := s.findStudent(studentID)
	if student == nil {
		http.Error(w, "student not found", http.StatusNotFound)
		return
	}
	level := "Bronze"
	if student.MonthlyCO2SavedKg >= 25 {
		level = "Gold"
	} else if student.MonthlyCO2SavedKg >= 12 {
		level = "Silver"
	}
	writeJSON(w, http.StatusOK, map[string]any{
		"studentId":        student.ID,
		"student":          student.Name,
		"totalKg":          round(student.CO2SavedKg),
		"monthlyKg":        round(student.MonthlyCO2SavedKg),
		"badge":            level,
		"nextBadgeAtKg":    map[string]float64{"Bronze": 12, "Silver": 25, "Gold": 50}[level],
		"message":          fmt.Sprintf("You saved %.1fkg CO2 this month!", student.MonthlyCO2SavedKg),
		"completedRides":   student.CompletedRideCount,
		"gamifiedProgress": math.Min(100, round((student.MonthlyCO2SavedKg/25)*100)),
	})
}

func (s *Server) findStudent(id int) (*Student, int) {
	for i := range s.students {
		if s.students[i].ID == id {
			return &s.students[i], i
		}
	}
	return nil, -1
}

func (s *Server) findRide(id int) (*Ride, int) {
	for i := range s.rides {
		if s.rides[i].ID == id {
			return &s.rides[i], i
		}
	}
	return nil, -1
}

func (s *Server) findRequest(id int) *RideRequest {
	for i := range s.requests {
		if s.requests[i].ID == id {
			return &s.requests[i]
		}
	}
	return nil
}

func (s *Server) studentIDByName(name string) int {
	s.mu.Lock()
	defer s.mu.Unlock()
	for _, student := range s.students {
		if strings.EqualFold(student.Name, name) {
			return student.ID
		}
	}
	return 2
}

func (s *Server) recalculateTrust(index int) {
	score := 55
	if s.students[index].EmailVerified {
		score += 15
	}
	if s.students[index].StudentID.Status == statusVerified {
		score += 15
	}
	if s.students[index].DriversLicense.Status == statusVerified {
		score += 10
	}
	if s.students[index].RatingAsDriver >= 4.5 || s.students[index].RatingAsPassenger >= 4.5 {
		score += 5
	}
	if score > 100 {
		score = 100
	}
	s.students[index].TrustScore = score
	s.students[index].PayLaterEligible = score >= 85 && s.students[index].CompletedRideCount >= 3
}

func (s *Server) genderAllowed(studentID int, ride Ride) bool {
	if ride.GenderPref == "" || strings.EqualFold(ride.GenderPref, "Any") {
		return true
	}
	student, _ := s.findStudent(studentID)
	if student == nil {
		return false
	}
	return strings.EqualFold(ride.GenderPref, "Women only") && strings.EqualFold(student.Gender, "Woman")
}

func (s *Server) notify(studentID int, kind, title, body string) {
	s.notifications = append(s.notifications, Notification{
		ID:        s.next.Notification,
		StudentID: studentID,
		Type:      kind,
		Title:     title,
		Body:      body,
		CreatedAt: now(),
	})
	s.next.Notification++
}

func (s *Server) notifyMatchingStudents(ride Ride) {
	for _, student := range s.students {
		if student.ID == ride.DriverID || !s.genderAllowed(student.ID, ride) {
			continue
		}
		if strings.EqualFold(student.College, ride.College) {
			s.notify(student.ID, "ride-match", "New ride near your college", fmt.Sprintf("%s posted %s to %s at %s.", ride.DriverName, ride.From, ride.To, ride.Time))
		}
	}
}

func (s *Server) addWaitlistLocked(rideID, studentID int, route, college string) WaitlistEntry {
	position := 1
	for _, entry := range s.waitlists {
		if entry.RideID == rideID && entry.Status == requestWaitlist {
			position++
		}
	}
	entry := WaitlistEntry{
		ID:          s.next.Waitlist,
		RideID:      rideID,
		StudentID:   studentID,
		Route:       route,
		College:     college,
		Status:      requestWaitlist,
		Position:    position,
		RequestedAt: now(),
	}
	s.next.Waitlist++
	s.waitlists = append(s.waitlists, entry)
	s.notify(studentID, "waitlist", "Added to waitlist", "You are position "+strconv.Itoa(position)+" for this ride.")
	return entry
}

func (s *Server) promoteWaitlistLocked(ride Ride) {
	for i := range s.waitlists {
		if s.waitlists[i].RideID == ride.ID && s.waitlists[i].Status == requestWaitlist {
			s.waitlists[i].Status = "SeatAvailable"
			s.notify(s.waitlists[i].StudentID, "waitlist", "Seat available", "A seat opened for "+ride.From+" to "+ride.To+".")
			return
		}
	}
}

func (s *Server) applyCarbonForTripLocked(trip Trip) {
	ride, _ := s.findRide(trip.RideID)
	if ride == nil {
		return
	}
	share := ride.CarbonSavedKg / math.Max(1, float64(len(trip.PassengerIDs)))
	for _, passengerID := range trip.PassengerIDs {
		if _, index := s.findStudent(passengerID); index >= 0 {
			s.students[index].CO2SavedKg += share
			s.students[index].MonthlyCO2SavedKg += share
			s.students[index].CompletedRideCount++
			s.recalculateTrust(index)
			s.notify(passengerID, "carbon", "CO2 saved", fmt.Sprintf("You saved %.1fkg CO2 on this ride.", share))
		}
	}
	if _, index := s.findStudent(ride.DriverID); index >= 0 {
		s.students[index].CompletedRideCount++
		s.recalculateTrust(index)
	}
}

func (s *Server) updateRatingLocked(studentID int, role string) {
	total := 0
	count := 0
	for _, rating := range s.ratings {
		if rating.ToID == studentID && strings.EqualFold(rating.Role, role) {
			total += rating.Score
			count++
		}
	}
	if count == 0 {
		return
	}
	if _, index := s.findStudent(studentID); index >= 0 {
		average := round(float64(total) / float64(count))
		if strings.EqualFold(role, "driver") {
			s.students[index].RatingAsDriver = average
		} else {
			s.students[index].RatingAsPassenger = average
		}
		s.recalculateTrust(index)
	}
}

func containsAny(ride Ride, query string) bool {
	values := []string{ride.DriverName, ride.College, ride.From, ride.To, ride.Vehicle, ride.MeetingPoint, ride.RouteSummary}
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

func calculateFare(distanceKm, fuelCostPerKm float64, seats int) FareQuote {
	if seats < 1 {
		seats = 1
	}
	if distanceKm <= 0 {
		distanceKm = 5
	}
	if fuelCostPerKm <= 0 {
		fuelCostPerKm = 8.5
	}
	platformFee := 5
	fare := int(math.Ceil((distanceKm*fuelCostPerKm)/float64(seats))) + platformFee
	return FareQuote{
		DistanceKm:      round(distanceKm),
		FuelCostPerKm:   fuelCostPerKm,
		Seats:           seats,
		PlatformFee:     platformFee,
		RecommendedFare: fare,
		Formula:         "(distanceKm * fuelCostPerKm / seats) + platformFee",
	}
}

func calculateCarbon(distanceKm float64, seats int) float64 {
	return round(distanceKm * float64(seats) * 0.12)
}

func routeOverlap(a, b []RoutePoint) (float64, int) {
	if len(a) == 0 || len(b) == 0 {
		return 0, 0
	}
	matches := 0
	for _, pointA := range a {
		for _, pointB := range b {
			if distanceKm(pointA, pointB) <= 2.5 || stringOverlap(pointA.Name, pointB.Name) {
				matches++
				break
			}
		}
	}
	score := float64(matches) / float64(max(len(a), len(b)))
	return score, matches
}

func estimateDistance(route []RoutePoint) float64 {
	if len(route) < 2 {
		return 5
	}
	total := 0.0
	for i := 1; i < len(route); i++ {
		total += distanceKm(route[i-1], route[i])
	}
	return round(math.Max(total, 2))
}

func distanceKm(a, b RoutePoint) float64 {
	const earthRadius = 6371
	lat1 := a.Lat * math.Pi / 180
	lat2 := b.Lat * math.Pi / 180
	dLat := (b.Lat - a.Lat) * math.Pi / 180
	dLng := (b.Lng - a.Lng) * math.Pi / 180
	h := math.Sin(dLat/2)*math.Sin(dLat/2) + math.Cos(lat1)*math.Cos(lat2)*math.Sin(dLng/2)*math.Sin(dLng/2)
	return earthRadius * 2 * math.Atan2(math.Sqrt(h), math.Sqrt(1-h))
}

func routeFromNames(from, to string) []RoutePoint {
	return []RoutePoint{pointFor(from), pointFor(to)}
}

func pointFor(name string) RoutePoint {
	points := map[string]RoutePoint{
		"indiranagar":  {Name: "Indiranagar Metro", Lat: 12.9784, Lng: 77.6408},
		"rvce":         {Name: "RVCE Mysore Road", Lat: 12.9237, Lng: 77.4987},
		"jayanagar":    {Name: "Jayanagar 4th Block", Lat: 12.9250, Lng: 77.5938},
		"koramangala":  {Name: "Koramangala 5th Block", Lat: 12.9352, Lng: 77.6245},
		"christ":       {Name: "Christ Central Campus", Lat: 12.9344, Lng: 77.6069},
		"btm":          {Name: "BTM Layout", Lat: 12.9166, Lng: 77.6101},
		"pes":          {Name: "PES RR Campus", Lat: 12.9351, Lng: 77.5354},
		"yeshwanthpur": {Name: "Yeshwanthpur Metro", Lat: 13.0238, Lng: 77.5500},
		"msrit":        {Name: "MSRIT Main Gate", Lat: 13.0308, Lng: 77.5649},
		"marathahalli": {Name: "Marathahalli Bridge", Lat: 12.9569, Lng: 77.7011},
		"silk board":   {Name: "Silk Board", Lat: 12.9177, Lng: 77.6238},
	}
	lower := strings.ToLower(name)
	for key, point := range points {
		if strings.Contains(lower, key) {
			return point
		}
	}
	hash := 0
	for _, char := range lower {
		hash += int(char)
	}
	return RoutePoint{Name: name, Lat: 12.90 + float64(hash%20)/100, Lng: 77.50 + float64(hash%25)/100}
}

func routeSummary(route []RoutePoint) string {
	names := make([]string, 0, len(route))
	for _, point := range route {
		names = append(names, point.Name)
	}
	return strings.Join(names, " -> ")
}

func matchReason(score float64, ride Ride) string {
	if score >= 0.67 {
		return "Strong route overlap with " + ride.RouteSummary
	}
	if ride.Recurring.Enabled {
		return "Recurring route with partial overlap"
	}
	return "Pickup or destination is near your route"
}

func containsPhoneNumber(text string) bool {
	digits := 0
	for _, char := range text {
		if char >= '0' && char <= '9' {
			digits++
		}
	}
	return digits >= 8
}

func buildUPILink(name, vpa string, amount int) string {
	values := url.Values{}
	values.Set("pa", vpa)
	values.Set("pn", name)
	values.Set("am", strconv.Itoa(amount))
	values.Set("cu", "INR")
	values.Set("tn", "CampusPool ride split")
	return "upi://pay?" + values.Encode()
}

func emailDomain(email string) (string, error) {
	parts := strings.Split(strings.TrimSpace(strings.ToLower(email)), "@")
	if len(parts) != 2 || parts[0] == "" || parts[1] == "" {
		return "", fmt.Errorf("valid college email is required")
	}
	return parts[1], nil
}

func intQuery(r *http.Request, key string) int {
	value, _ := strconv.Atoi(r.URL.Query().Get(key))
	return value
}

func parseIDAction(path, prefix string) (int, string, bool) {
	rest := strings.TrimPrefix(path, prefix)
	parts := strings.Split(rest, "/")
	if len(parts) != 2 {
		return 0, "", false
	}
	id, err := strconv.Atoi(parts[0])
	if err != nil {
		return 0, "", false
	}
	return id, parts[1], true
}

func roleFor(studentID int, request RideRequest, ride Ride) string {
	if studentID == ride.DriverID {
		return "driver"
	}
	if studentID == request.PassengerID {
		return "passenger"
	}
	return "viewer"
}

func stringOverlap(a, b string) bool {
	a = strings.ToLower(a)
	b = strings.ToLower(b)
	return a != "" && b != "" && (strings.Contains(a, b) || strings.Contains(b, a))
}

func defaultString(value, fallback string) string {
	if strings.TrimSpace(value) == "" {
		return fallback
	}
	return value
}

func defaultInt(value, fallback int) int {
	if value == 0 {
		return fallback
	}
	return value
}

func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}

func round(value float64) float64 {
	return math.Round(value*10) / 10
}

func now() string {
	return time.Now().Format(time.RFC3339)
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(value)
}

func seedStudents() []Student {
	return []Student{
		{
			ID: 1, Name: "Aarav S", Email: "aarav@rvce.edu.in", College: "RV College of Engineering", Gender: "Man", EmailVerified: true,
			StudentID:       Verification{Status: statusVerified, DocumentID: "RVCE-ID-1001", UploadedAt: now(), ReviewedAt: now()},
			DriversLicense:  Verification{Status: statusVerified, DocumentID: "KA-DL-2201", UploadedAt: now(), ReviewedAt: now()},
			TrustedContacts: []TrustedContact{{Name: "Aarav Parent", Phone: "+919900000001"}},
			RatingAsDriver:  4.9, RatingAsPassenger: 4.8, TrustScore: 95, PayLaterEligible: true, CO2SavedKg: 38.4, MonthlyCO2SavedKg: 12.2, CompletedRideCount: 18, CreatedAt: now(),
		},
		{
			ID: 2, Name: "Demo Student", Email: "demo@rvce.edu.in", College: "RV College of Engineering", Gender: "Woman", EmailVerified: true,
			StudentID:       Verification{Status: statusVerified, DocumentID: "RVCE-ID-2222", UploadedAt: now(), ReviewedAt: now()},
			DriversLicense:  Verification{Status: statusPending},
			TrustedContacts: []TrustedContact{{Name: "Demo Guardian", Phone: "+919900000002"}},
			RatingAsDriver:  0, RatingAsPassenger: 4.7, TrustScore: 86, PayLaterEligible: true, CO2SavedKg: 18.7, MonthlyCO2SavedKg: 7.4, CompletedRideCount: 7, CreatedAt: now(),
		},
		{
			ID: 3, Name: "Nisha K", Email: "nisha@christuniversity.in", College: "Christ University", Gender: "Woman", EmailVerified: true,
			StudentID:       Verification{Status: statusVerified, DocumentID: "CHRIST-ID-103", UploadedAt: now(), ReviewedAt: now()},
			DriversLicense:  Verification{Status: statusVerified, DocumentID: "KA-DL-3321", UploadedAt: now(), ReviewedAt: now()},
			TrustedContacts: []TrustedContact{{Name: "Christ Security", Phone: "+918000000003"}},
			RatingAsDriver:  4.8, RatingAsPassenger: 4.9, TrustScore: 96, PayLaterEligible: true, CO2SavedKg: 44.1, MonthlyCO2SavedKg: 16.3, CompletedRideCount: 22, CreatedAt: now(),
		},
		{
			ID: 4, Name: "Rahul M", Email: "rahul@pes.edu", College: "PES University", Gender: "Man", EmailVerified: true,
			StudentID:       Verification{Status: statusVerified, DocumentID: "PES-ID-321", UploadedAt: now(), ReviewedAt: now()},
			DriversLicense:  Verification{Status: statusVerified, DocumentID: "KA-DL-7765", UploadedAt: now(), ReviewedAt: now()},
			TrustedContacts: []TrustedContact{{Name: "Rahul Friend", Phone: "+919900000004"}},
			RatingAsDriver:  4.7, RatingAsPassenger: 4.6, TrustScore: 92, PayLaterEligible: true, CO2SavedKg: 31.5, MonthlyCO2SavedKg: 9.1, CompletedRideCount: 15, CreatedAt: now(),
		},
		{
			ID: 5, Name: "Meera P", Email: "meera@msrit.edu", College: "MS Ramaiah Institute of Technology", Gender: "Woman", EmailVerified: true,
			StudentID:       Verification{Status: statusVerified, DocumentID: "MSRIT-ID-761", UploadedAt: now(), ReviewedAt: now()},
			DriversLicense:  Verification{Status: statusVerified, DocumentID: "KA-DL-8891", UploadedAt: now(), ReviewedAt: now()},
			TrustedContacts: []TrustedContact{{Name: "Meera Parent", Phone: "+919900000005"}},
			RatingAsDriver:  4.9, RatingAsPassenger: 4.8, TrustScore: 96, PayLaterEligible: true, CO2SavedKg: 27.8, MonthlyCO2SavedKg: 13.6, CompletedRideCount: 12, CreatedAt: now(),
		},
	}
}

func seedRides() []Ride {
	rides := []Ride{
		{
			ID: 1, DriverID: 1, DriverName: "Aarav S", College: "RV College of Engineering", From: "Indiranagar Metro", To: "RVCE Mysore Road",
			Route: []RoutePoint{pointFor("Indiranagar"), pointFor("Jayanagar"), pointFor("RVCE")}, Date: "2026-05-23", Time: "08:10",
			Recurring: Recurring{Enabled: true, Days: []string{"Mon", "Tue", "Wed", "Thu", "Fri"}, Until: "2026-08-31"},
			Seats:     3, AvailableSeats: 3, FuelCostPerKm: 8.5, GenderPref: "Any", Vehicle: "Hyundai i20", Rating: 4.9, Verified: true,
			Tags: []string{"Fast match", "UPI split", "College ID required", "Recurring"}, Status: "Open", MeetingPoint: "Gate 2 metro exit", EmergencyShared: true, HubID: 1, CreatedAt: now(),
		},
		{
			ID: 2, DriverID: 3, DriverName: "Nisha K", College: "Christ University", From: "Koramangala 5th Block", To: "Christ Central Campus",
			Route: []RoutePoint{pointFor("Koramangala"), pointFor("Christ")}, Date: "2026-05-23", Time: "07:45",
			Seats: 2, AvailableSeats: 2, FuelCostPerKm: 4.5, GenderPref: "Women only", Vehicle: "Honda Activa", Rating: 4.8, Verified: true,
			Tags: []string{"Women only", "Helmet available", "Live trip sharing"}, Status: "Open", MeetingPoint: "Forum signal", EmergencyShared: true, HubID: 2, CreatedAt: now(),
		},
		{
			ID: 3, DriverID: 4, DriverName: "Rahul M", College: "PES University", From: "BTM Layout", To: "PES RR Campus",
			Route: []RoutePoint{pointFor("BTM"), pointFor("Silk Board"), pointFor("PES")}, Date: "2026-05-23", Time: "08:25",
			Recurring: Recurring{Enabled: true, Days: []string{"Mon", "Wed", "Fri"}, Until: "2026-07-30"},
			Seats:     4, AvailableSeats: 4, FuelCostPerKm: 8.8, GenderPref: "Any", Vehicle: "Maruti Swift", Rating: 4.7, Verified: true,
			Tags: []string{"Recurring", "Music okay", "No smoking"}, Status: "Open", MeetingPoint: "BTM water tank", EmergencyShared: true, HubID: 3, CreatedAt: now(),
		},
		{
			ID: 4, DriverID: 5, DriverName: "Meera P", College: "MS Ramaiah Institute of Technology", From: "Yeshwanthpur", To: "MSRIT Main Gate",
			Route: []RoutePoint{pointFor("Yeshwanthpur"), pointFor("MSRIT")}, Date: "2026-05-23", Time: "09:00",
			Seats: 1, AvailableSeats: 1, FuelCostPerKm: 4.2, GenderPref: "Women only", Vehicle: "TVS Jupiter", Rating: 4.9, Verified: true,
			Tags: []string{"Women only", "Short ride", "Verified route"}, Status: "Open", MeetingPoint: "Yeshwanthpur metro", EmergencyShared: true, HubID: 4, CreatedAt: now(),
		},
	}
	for i := range rides {
		rides[i].DistanceKm = estimateDistance(rides[i].Route)
		rides[i].RouteSummary = routeSummary(rides[i].Route)
		rides[i].AutoFare = calculateFare(rides[i].DistanceKm, rides[i].FuelCostPerKm, rides[i].Seats)
		rides[i].Price = rides[i].AutoFare.RecommendedFare
		rides[i].CarbonSavedKg = calculateCarbon(rides[i].DistanceKm, rides[i].Seats)
	}
	return rides
}

func seedHubs() []Hub {
	return []Hub{
		{ID: 1, Name: "Indiranagar Metro Gate 2", College: "RV College of Engineering", Area: "Indiranagar", Coordinates: pointFor("Indiranagar"), PopularFor: []string{"Metro commuters", "PG clusters"}},
		{ID: 2, Name: "Forum Koramangala Signal", College: "Christ University", Area: "Koramangala", Coordinates: pointFor("Koramangala"), PopularFor: []string{"Hostels", "Shared flats"}},
		{ID: 3, Name: "BTM Water Tank", College: "PES University", Area: "BTM Layout", Coordinates: pointFor("BTM"), PopularFor: []string{"PG lanes", "Morning peak"}},
		{ID: 4, Name: "Yeshwanthpur Metro", College: "MS Ramaiah Institute of Technology", Area: "Yeshwanthpur", Coordinates: pointFor("Yeshwanthpur"), PopularFor: []string{"Metro", "Hostels"}},
		{ID: 5, Name: "Marathahalli Bridge", College: "PES University", Area: "Marathahalli", Coordinates: pointFor("Marathahalli"), PopularFor: []string{"Popular waitlist route", "Tech park PGs"}},
	}
}
