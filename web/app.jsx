const { useEffect, useMemo, useState } = React;

const colleges = [
  "RV College of Engineering",
  "Christ University",
  "PES University",
  "MS Ramaiah Institute of Technology",
  "BMS College of Engineering",
  "Dayananda Sagar University"
];

const dashboardSections = [
  { id: "find", label: "Find ride", icon: "compass" },
  { id: "offer", label: "Offer ride", icon: "car" },
  { id: "requests", label: "Requests", icon: "message" },
  { id: "safety", label: "Safety", icon: "shield" },
  { id: "payments", label: "Payments", icon: "wallet" },
  { id: "impact", label: "Impact", icon: "leaf" }
];

const defaultSearch = {
  from: "Jayanagar 4th Block",
  to: "RVCE Mysore Road",
  date: "2026-05-23",
  passengers: 1,
  college: "RV College of Engineering",
  gender: "All"
};

const defaultRide = {
  driverId: 1,
  college: "RV College of Engineering",
  from: "Jayanagar 4th Block",
  to: "RVCE Mysore Road",
  date: "2026-05-23",
  time: "08:00",
  seats: 2,
  distanceKm: 11.5,
  fuelCostPerKm: 8.5,
  genderPref: "Any",
  vehicle: "Maruti Baleno",
  meetingPoint: "Metro gate",
  emergencyShared: true,
  recurring: { enabled: true, days: ["Mon", "Tue", "Wed", "Thu", "Fri"], until: "2026-08-31" }
};

// ==========================================
// SVG Icon Helpers (Modern, lightweight)
// ==========================================
function Icon({ name, className = "icon-svg" }) {
  const icons = {
    compass: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
      </svg>
    ),
    car: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2" ry="2" />
        <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
    message: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    shield: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    wallet: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
        <line x1="1" y1="10" x2="23" y2="10" />
      </svg>
    ),
    leaf: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8a7 7 0 0 1-9 10z" />
        <path d="M9 22v-4" />
      </svg>
    ),
    bell: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    logout: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
    ),
    star: (
      <svg viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    user: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    search: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
    ),
    arrowRight: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="5" y1="12" x2="19" y2="12" />
        <polyline points="12 5 19 12 12 19" />
      </svg>
    ),
    calendar: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    users: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    check: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
    clock: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    map: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="1 6 8 2 15 6 23 2 23 18 15 22 8 18 1 22" />
        <line x1="8" y1="2" x2="8" y2="18" />
        <line x1="15" y1="6" x2="15" y2="22" />
      </svg>
    )
  };
  return icons[name] || null;
}

// ==========================================
// Interactive Vector Mock Map
// ==========================================
function MockMap({ from, to, matches, activeTripId }) {
  const hubCoords = {
    "Jayanagar 4th Block": { x: 260, y: 190, name: "Jayanagar Hub" },
    "RVCE Mysore Road": { x: 90, y: 280, name: "RVCE Campus" },
    "RV College of Engineering": { x: 90, y: 280, name: "RVCE Campus" },
    "Christ University": { x: 370, y: 230, name: "Christ Univ" },
    "PES University": { x: 190, y: 250, name: "PES Campus" },
    "MS Ramaiah Institute of Technology": { x: 210, y: 60, name: "MSRIT Campus" },
    "BMS College of Engineering": { x: 230, y: 200, name: "BMS Campus" },
    "Dayananda Sagar University": { x: 310, y: 310, name: "DSU Campus" },
    "Silk Board": { x: 390, y: 290, name: "Silk Board Jnc" },
    "Indiranagar Metro": { x: 410, y: 110, name: "Indiranagar Metro" },
    "Electronic City Phase 1": { x: 430, y: 380, name: "Electronic City" }
  };

  const getCoordinates = (locName) => {
    if (!locName) return null;
    const clean = locName.trim().toLowerCase();
    for (const key of Object.keys(hubCoords)) {
      if (clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
        return hubCoords[key];
      }
    }
    let hash = 0;
    for (let i = 0; i < clean.length; i++) {
      hash = clean.charCodeAt(i) + ((hash << 5) - hash);
    }
    const x = 100 + Math.abs(hash % 300);
    const y = 80 + Math.abs((hash >> 2) % 240);
    return { x, y, name: locName };
  };

  const startPt = getCoordinates(from) || { x: 130, y: 160, name: from || "Start Point" };
  const endPt = getCoordinates(to) || { x: 360, y: 270, name: to || "Destination Hub" };
  
  const hasRoute = from && to;
  const pathD = hasRoute 
    ? `M ${startPt.x} ${startPt.y} Q ${(startPt.x + endPt.x)/2 + 40} ${(startPt.y + endPt.y)/2 - 50} ${endPt.x} ${endPt.y}`
    : "";

  return (
    <div className="mock-map">
      <div className="map-badge-status">
        <Icon name="map" className="map-badge-icon" />
        <span>{hasRoute ? "Route active" : "Map tracking system"}</span>
      </div>
      <svg className="mock-map-svg" viewBox="0 0 500 400" width="100%" height="100%">
        <defs>
          <pattern id="map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(0,0,0,0.03)" strokeWidth="0.5" />
          </pattern>
          <filter id="card-shadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.1" />
          </filter>
        </defs>

        <rect width="100%" height="100%" fill="#f1f3f4" />
        <rect width="100%" height="100%" fill="url(#map-grid)" />

        {/* Parks & Water bodies */}
        <path d="M 120 40 Q 150 15 200 40 T 260 60 T 220 100 T 130 80 Z" fill="#e1f5fe" opacity="0.65" /> {/* Lake */}
        <path d="M 230 140 Q 280 110 320 150 T 280 220 T 220 190 Z" fill="#e8f5e9" /> {/* Park */}
        <path d="M 60 270 Q 90 290 120 270 T 150 300 T 100 330 T 50 300 Z" fill="#e8f5e9" /> {/* Park */}

        {/* Major Roads */}
        <path d="M -10 180 L 510 180" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        <path d="M -10 180 L 510 180" stroke="#e0e0e0" strokeWidth="4" strokeLinecap="round" />
        
        <path d="M 250 -10 L 250 410" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" />
        <path d="M 250 -10 L 250 410" stroke="#e0e0e0" strokeWidth="4" strokeLinecap="round" />

        <path d="M 20 320 L 480 80" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" />
        <path d="M 20 320 L 480 80" stroke="#e3e3e3" strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 3" />

        {/* Route visualization */}
        {hasRoute && (
          <>
            {/* Route track */}
            <path id="active-route" d={pathD} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={pathD} fill="none" stroke="#2563eb" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" opacity="0.15" className="glow-path" />

            {/* Pulsating dots for start and end */}
            <g transform={`translate(${startPt.x}, ${startPt.y})`}>
              <circle r="12" fill="#10b981" opacity="0.25">
                <animate attributeName="r" values="6;16;6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r="6" fill="#10b981" stroke="#ffffff" strokeWidth="1.5" />
            </g>

            <g transform={`translate(${endPt.x}, ${endPt.y})`}>
              <circle r="12" fill="#ef4444" opacity="0.25">
                <animate attributeName="r" values="6;16;6" dur="2.4s" repeatCount="indefinite" />
              </circle>
              <circle r="6" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
            </g>

            {/* Simulated moving car along the path */}
            <g>
              <circle r="11" fill="#09090b" filter="url(#card-shadow)" />
              <circle r="9" fill="#c7f24a" />
              {/* Car Icon Silhouette */}
              <path d="M -5 -2 L 5 -2 L 3 3 L -3 3 Z" fill="#09090b" transform="scale(0.75)" />
              <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                <mpath href="#active-route" />
              </animateMotion>
            </g>
          </>
        )}

        {/* Major campus hubs pins */}
        {Object.entries(hubCoords).map(([name, pt], index) => {
          const isSelected = (from && name.toLowerCase().includes(from.trim().toLowerCase())) || 
                             (to && name.toLowerCase().includes(to.trim().toLowerCase()));

          // Display subset of labels to prevent cluttering
          if (index > 7 && !isSelected) return null;

          return (
            <g key={name} transform={`translate(${pt.x}, ${pt.y})`} className="hub-marker">
              {!isSelected && <circle r="4" fill="#71717a" stroke="#ffffff" strokeWidth="1" />}
              <text y="-8" textAnchor="middle" fontSize="9" fontWeight="700" fill="#09090b" filter="url(#card-shadow)" opacity="0.75">
                {pt.name}
              </text>
            </g>
          );
        })}
      </svg>

      {hasRoute && (
        <div className="map-legend">
          <div className="legend-item"><span className="legend-color green"></span> Pickup</div>
          <div className="legend-item"><span className="legend-color red"></span> Destination</div>
          <div className="legend-item"><span className="legend-color blue"></span> Car pool path</div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// Main Application Component
// ==========================================
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState(null);
  const [activeSection, setActiveSection] = useState("find");
  const [rides, setRides] = useState([]);
  const [students, setStudents] = useState([]);
  const [hubs, setHubs] = useState([]);
  const [stats, setStats] = useState(null);
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [history, setHistory] = useState([]);
  const [waitlists, setWaitlists] = useState([]);
  const [carbon, setCarbon] = useState(null);
  const [search, setSearch] = useState(defaultSearch);
  const [matches, setMatches] = useState([]);
  const [rideForm, setRideForm] = useState(defaultRide);
  const [fareQuote, setFareQuote] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [chatDraft, setChatDraft] = useState("Is Gate 2 a good pickup point?");
  const [activeTripId, setActiveTripId] = useState(null);
  const [lastPayment, setLastPayment] = useState(null);
  const [toast, setToast] = useState("");

  const visibleRides = useMemo(() => {
    const source = matches.length ? matches.map((match) => ({ ...match.ride, overlapScore: match.overlapScore })) : rides;
    return source.filter((ride) => {
      const tags = Array.isArray(ride.tags) ? ride.tags.join(" ") : "";
      const haystack = `${ride.driverName} ${ride.college} ${ride.from} ${ride.to} ${tags} ${ride.routeSummary}`.toLowerCase();
      const textMatch = haystack.includes(search.from.toLowerCase().split(" ")[0] || "") || haystack.includes(search.to.toLowerCase().split(" ")[0] || "");
      const genderMatch = search.gender === "All" || ride.genderPref === search.gender;
      return textMatch && genderMatch;
    });
  }, [matches, rides, search]);

  async function loadBaseData(user = currentUser) {
    const [ridesResponse, statsResponse, studentsResponse, hubsResponse] = await Promise.all([
      fetch("/api/rides"),
      fetch("/api/stats"),
      fetch("/api/students"),
      fetch("/api/hubs")
    ]);
    setRides(await ridesResponse.json());
    setStats(await statsResponse.json());
    const studentData = await studentsResponse.json();
    setStudents(studentData);
    setHubs(await hubsResponse.json());

    if (user) {
      const freshUser = studentData.find((student) => student.id === user.id) || user;
      setCurrentUser(freshUser);
      await loadUserData(freshUser.id);
    }
  }

  async function loadUserData(studentId) {
    const [requestsResponse, notificationsResponse, historyResponse, waitlistsResponse, carbonResponse] = await Promise.all([
      fetch(`/api/ride-requests?studentId=${studentId}`),
      fetch(`/api/notifications?studentId=${studentId}`),
      fetch(`/api/history?studentId=${studentId}`),
      fetch("/api/waitlists"),
      fetch(`/api/carbon?studentId=${studentId}`)
    ]);
    setRequests(await requestsResponse.json());
    setNotifications(await notificationsResponse.json());
    setHistory(await historyResponse.json());
    setWaitlists(await waitlistsResponse.json());
    if (carbonResponse.ok) {
      setCarbon(await carbonResponse.json());
    }
  }

  useEffect(() => {
    loadBaseData().catch(() => setToast("Could not reach the Go API"));
  }, []);

  async function apiCall(label, path, body, method = "POST") {
    const response = await fetch(path, {
      method,
      headers: method === "GET" ? undefined : { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    let data = text;
    try {
      data = JSON.parse(text);
    } catch {
      data = { error: text };
    }
    if (!response.ok) {
      const message = typeof data === "string" ? data : data.error || response.statusText;
      setToast(`${label} failed: ${message}`);
      return null;
    }
    await loadBaseData(currentUser);
    setToast(`${label} completed`);
    return data;
  }

  async function login(email) {
    const user = await apiCall("Login", "/api/auth/login", { email });
    if (!user) return;
    setCurrentUser(user);
    setAuthMode(null);
    setActiveSection("find");
    await loadBaseData(user);
    setToast(`Welcome back, ${user.name}`);
  }

  async function signup(form) {
    const user = await apiCall("Signup", "/api/auth/signup", {
      name: form.name,
      email: form.email,
      gender: form.gender,
      trustedContacts: [{ name: "Guardian", phone: form.guardianPhone || "+919900000000" }]
    });
    if (!user) return;
    setCurrentUser(user);
    setAuthMode(null);
    setActiveSection("safety");
    await loadBaseData(user);
    setToast("Account created. Complete verification to unlock all ride actions.");
  }

  async function demoLogin(studentId) {
    const user = students.find((student) => student.id === studentId);
    if (!user) return;
    await login(user.email);
  }

  async function searchMatches(event) {
    event?.preventDefault();
    if (!currentUser) {
      setAuthMode("login");
      setToast("Login with your college email to see verified campus rides.");
      return;
    }
    const data = await apiCall("Route search", "/api/matches", {
      studentId: currentUser.id,
      college: search.college,
      from: search.from,
      to: search.to
    });
    if (Array.isArray(data)) {
      setMatches(data);
      setActiveSection("find");
    }
  }

  async function requestRide(ride) {
    if (!currentUser) {
      setAuthMode("login");
      return;
    }
    const response = await apiCall("Ride request", "/api/ride-requests", {
      rideId: ride.id,
      passengerId: currentUser.id,
      seatCount: Number(search.passengers) || 1,
      message: `Requesting ${search.passengers || 1} seat from ${search.from}`
    });
    if (response?.status === "Waitlisted") {
      setToast(`Added to waitlist at position ${response.position}`);
      setActiveSection("impact");
      return;
    }
    if (response?.id) {
      setSelectedRequestId(response.id);
      setActiveSection("requests");
    }
  }

  async function createRide(event) {
    event.preventDefault();
    if (!currentUser) {
      setAuthMode("login");
      return;
    }
    const created = await apiCall("Publish ride", "/api/rides", {
      ...rideForm,
      driverId: currentUser.id,
      driverName: currentUser.name,
      college: currentUser.college,
      seats: Number(rideForm.seats),
      distanceKm: Number(rideForm.distanceKm),
      fuelCostPerKm: Number(rideForm.fuelCostPerKm)
    });
    if (created) {
      setActiveSection("find");
      setMatches([]);
    }
  }

  async function verify(kind) {
    if (!currentUser) return;
    const path = kind === "license" ? "/api/verifications/license" : "/api/verifications/student-id";
    await apiCall(kind === "license" ? "Driver license verification" : "Student ID verification", path, {
      studentId: currentUser.id,
      documentId: kind === "license" ? "KA-DL-DEMO" : `${currentUser.college.slice(0, 4).toUpperCase()}-ID-DEMO`,
      approve: true
    });
  }

  async function calculateFare() {
    const quote = await apiCall("Fare estimate", "/api/payments/calculate", {
      distanceKm: Number(rideForm.distanceKm),
      fuelCostPerKm: Number(rideForm.fuelCostPerKm),
      seats: Number(rideForm.seats)
    });
    if (quote) setFareQuote(quote);
  }

  async function loadChat(requestId) {
    setSelectedRequestId(requestId);
    const response = await fetch(`/api/chat?requestId=${requestId}`);
    setChatMessages(await response.json());
  }

  async function sendChat() {
    if (!selectedRequestId || !currentUser) return;
    const message = await apiCall("Message", "/api/chat", {
      requestId: selectedRequestId,
      senderId: currentUser.id,
      text: chatDraft
    });
    if (message) {
      setChatDraft("");
      await loadChat(selectedRequestId);
    }
  }

  async function acceptRequest(requestId) {
    await apiCall("Accept request", `/api/ride-requests/${requestId}/accept`, {});
    setSelectedRequestId(requestId);
  }

  async function startTrip(requestId) {
    const trip = await apiCall("Start trip", "/api/trips/start", { requestId });
    if (trip) {
      setActiveTripId(trip.id);
      await apiCall("Share live location", `/api/trips/${trip.id}/location`, {
        studentId: currentUser.id,
        lat: 12.925,
        lng: 77.5938,
        speedKph: 24
      });
    }
  }

  async function triggerSOS() {
    if (!activeTripId) {
      setToast("Start an accepted trip before using SOS.");
      return;
    }
    await apiCall("SOS", `/api/trips/${activeTripId}/sos`, {
      studentId: currentUser?.id || 2,
      message: "SOS emergency event triggered!"
    });
  }

  async function createPayment() {
    const request = requests.find((item) => item.status === "Accepted") || requests[0];
    if (!request || !currentUser) {
      setToast("Request a ride first to generate a payment.");
      return;
    }
    const ride = rides.find((item) => item.id === request.rideId);
    const payment = await apiCall("Payment", "/api/payments", {
      requestId: request.id,
      payerId: request.passengerId,
      receiverId: ride?.driverId || 1,
      payLater: Boolean(currentUser.payLaterEligible)
    });
    if (payment) setLastPayment(payment);
  }

  function logout() {
    setCurrentUser(null);
    setAuthMode(null);
    setActiveSection("find");
    setRequests([]);
    setNotifications([]);
    setHistory([]);
    setCarbon(null);
    setToast("Signed out successfully");
  }

  return (
    <main className={currentUser ? "app-main" : "site-main"}>
      {!currentUser ? (
        <Landing
          stats={stats}
          search={search}
          setSearch={setSearch}
          onSearch={searchMatches}
          onAuth={setAuthMode}
          onDemoLogin={demoLogin}
        />
      ) : (
        <Dashboard
          currentUser={currentUser}
          stats={stats}
          rides={visibleRides}
          allRides={rides}
          students={students}
          hubs={hubs}
          requests={requests}
          notifications={notifications}
          history={history}
          waitlists={waitlists}
          carbon={carbon}
          search={search}
          setSearch={setSearch}
          activeSection={activeSection}
          setActiveSection={setActiveSection}
          rideForm={rideForm}
          setRideForm={setRideForm}
          fareQuote={fareQuote}
          chatMessages={chatMessages}
          selectedRequestId={selectedRequestId}
          chatDraft={chatDraft}
          setChatDraft={setChatDraft}
          onLogout={logout}
          onSearch={searchMatches}
          onRequestRide={requestRide}
          onCreateRide={createRide}
          onVerify={verify}
          onCalculateFare={calculateFare}
          onLoadChat={loadChat}
          onSendChat={sendChat}
          onAcceptRequest={acceptRequest}
          onStartTrip={startTrip}
          onSOS={triggerSOS}
          onCreatePayment={createPayment}
          activeTripId={activeTripId}
          lastPayment={lastPayment}
        />
      )}

      {toast && (
        <div className="toast animate-slide-in" role="status">
          <div className="toast-content">
            <Icon name="bell" className="toast-icon" />
            <span>{toast}</span>
          </div>
          <button className="toast-close" onClick={() => setToast("")}>&times;</button>
        </div>
      )}

      {authMode && (
        <AuthModal
          mode={authMode}
          onMode={setAuthMode}
          onClose={() => setAuthMode(null)}
          onLogin={login}
          onSignup={signup}
          onDemoLogin={demoLogin}
        />
      )}
    </main>
  );
}

// ==========================================
// Landing Page View
// ==========================================
function Landing({ stats, search, setSearch, onSearch, onAuth, onDemoLogin }) {
  return (
    <div className="landing-layout">
      <header className="landing-header">
        <nav className="landing-nav-bar">
          <div className="logo-section">
            <div className="brand-badge">CP</div>
            <span className="brand-name">CampusPool</span>
          </div>
          <div className="landing-menu-links">
            <a href="#features">Features</a>
            <a href="#trust">Safety &amp; Trust</a>
            <a href="#impact">Eco Savings</a>
          </div>
          <div className="auth-group">
            <button className="btn-ghost" onClick={() => onAuth("login")}>Sign In</button>
            <button className="btn-primary" onClick={() => onAuth("signup")}>Register</button>
          </div>
        </nav>
      </header>

      <section className="hero-split-section">
        <div className="hero-left-card">
          <div className="badge-promo">
            <Icon name="compass" className="promo-badge-icon" />
            <span>COMMUTE REINVENTED FOR BANGALORE CAMPUSES</span>
          </div>
          <h1>Everyday routes, shared fares.</h1>
          <p className="hero-subtitle">
            Skip the auto-rickshaw queue. Ride with fellow students from your PG, metro gate, or hostel directly to your college.
          </p>
          
          <div className="quick-search-box">
            <h3>Find rides in real time</h3>
            <RideSearchForm search={search} setSearch={setSearch} onSubmit={onSearch} compact={true} />
          </div>

          <div className="demo-shortcuts">
            <span className="demo-label">Quick demo login:</span>
            <button className="btn-secondary" onClick={() => onDemoLogin(2)}>
              <Icon name="user" className="btn-icon" /> Commuter Flow
            </button>
            <button className="btn-secondary" onClick={() => onDemoLogin(1)}>
              <Icon name="car" className="btn-icon" /> Driver Flow
            </button>
          </div>
        </div>

        <div className="hero-right-visual">
          <div className="visual-map-panel">
            <div className="visual-header">
              <span className="live-indicator"></span>
              <h4>Live Bangalore Commute Simulation</h4>
            </div>
            <MockMap from={search.from} to={search.to} />
          </div>
        </div>
      </section>

      <section className="features-section" id="features">
        <div className="section-head">
          <span className="section-eyebrow">Smart Infrastructure</span>
          <h2>A commute designed around trust, safety, and campus hubs.</h2>
        </div>
        <div className="features-grid">
          <div className="feat-card">
            <div className="feat-icon-container green"><Icon name="shield" /></div>
            <h3>Verified Academic Emails</h3>
            <p>Only users with active student domain emails (e.g., @sit.ac.in, @rvce.edu.in) can request or publish campus routes.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon-container blue"><Icon name="compass" /></div>
            <h3>Smart Route Overlap</h3>
            <p>Our algorithms match rides passing through your boarding circle, even if the driver start point is slightly different.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon-container yellow"><Icon name="message" /></div>
            <h3>In-App Chat Guard</h3>
            <p>Communicate coordinates with the driver. Chat automatically blocks phone number sharing until the request is accepted.</p>
          </div>
          <div className="feat-card">
            <div className="feat-icon-container green"><Icon name="wallet" /></div>
            <h3>UPI Split Engine</h3>
            <p>Autocalculated distance splits, direct payment deep-links, and eligibility for zero-cost Pay Later based on trust metrics.</p>
          </div>
        </div>
      </section>

      <section className="trust-stats-section" id="trust">
        <div className="trust-main-grid">
          <div className="trust-text-block">
            <span className="section-eyebrow">Safety Framework</span>
            <h2>We verify credentials so you commmute with peace of mind.</h2>
            <p>
              CampusPool requires Student ID validation and Government Driving Licenses prior to allowing any driver uploads. Trust indices are updated in real-time based on mutual ratings.
            </p>
            <div className="trust-badges-row">
              <div className="safety-badge">
                <Icon name="shield" className="sb-icon" />
                <span>Government ID Locked</span>
              </div>
              <div className="safety-badge">
                <Icon name="check" className="sb-icon" />
                <span>2-Way Rating Screen</span>
              </div>
            </div>
          </div>
          <div className="stats-metric-cards">
            <div className="stat-value-card">
              <span className="stat-title">Active Campus Rides</span>
              <strong className="stat-num">{stats?.activeRides ?? "24"}</strong>
            </div>
            <div className="stat-value-card">
              <span className="stat-title">Available Empty Seats</span>
              <strong className="stat-num">{stats?.seatsAvailable ?? "48"}</strong>
            </div>
            <div className="stat-value-card">
              <span className="stat-title">Verified Student Drivers</span>
              <strong className="stat-num">{stats?.verifiedDrivers ?? "12"}</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-impact-section" id="impact">
        <div className="impact-container-inner">
          <div className="impact-left-content">
            <span className="section-eyebrow">Eco Savings</span>
            <h2>Fewer single-rider vehicles. Cleaner university hubs.</h2>
            <p>
              We measure carbon offsets on every shared ride. Track your contributions directly on your dashboard.
            </p>
          </div>
          <div className="impact-right-progress">
            <div className="carbon-progress-box">
              <div className="cp-header">
                <Icon name="leaf" className="cp-icon" />
                <span>Total Bangalore CO2 Saved</span>
              </div>
              <strong className="cp-number">{stats?.monthlyCo2SavedKg?.toFixed(1) ?? "148.5"} KG</strong>
              <div className="progress-bar-container">
                <div className="progress-bar-fill" style={{ width: "68%" }}></div>
              </div>
              <span className="progress-caption">Goal reached: 68% of seasonal university carbon target</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="landing-footer-bar">
        <div className="footer-credits">
          <span>&copy; 2026 CampusPool Bangalore. Made for students.</span>
        </div>
      </footer>
    </div>
  );
}

// ==========================================
// Authentication Modal
// ==========================================
function AuthModal({ mode, onMode, onClose, onLogin, onSignup, onDemoLogin }) {
  const [loginEmail, setLoginEmail] = useState("demo@rvce.edu.in");
  const [signupForm, setSignupForm] = useState({
    name: "Sneha R",
    email: "sneha@sit.ac.in",
    gender: "Woman",
    guardianPhone: "+919900000099"
  });

  return (
    <div className="modal-overlay">
      <div className="modal-card animate-scale-up">
        <button className="modal-btn-close" onClick={onClose}>&times;</button>
        <div className="modal-tabs">
          <button className={`tab-link ${mode === "login" ? "active" : ""}`} onClick={() => onMode("login")}>Sign In</button>
          <button className={`tab-link ${mode === "signup" ? "active" : ""}`} onClick={() => onMode("signup")}>Sign Up</button>
        </div>

        {mode === "login" ? (
          <form onSubmit={(e) => { e.preventDefault(); onLogin(loginEmail); }} className="form-stack">
            <h3>Welcome back</h3>
            <p className="tab-desc">Log in with your verified academic email handle.</p>
            <label className="input-group">
              <span>College Email</span>
              <input type="email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} placeholder="name@rvce.edu.in" required />
            </label>
            <button type="submit" className="btn-submit">Verify &amp; Enter</button>
            
            <div className="demo-accounts-grid">
              <span>Simulate demo logins:</span>
              <div className="demo-accounts-row">
                <button type="button" className="btn-secondary-sm" onClick={() => onDemoLogin(2)}>Rider Account</button>
                <button type="button" className="btn-secondary-sm" onClick={() => onDemoLogin(1)}>Driver Account</button>
              </div>
            </div>
          </form>
        ) : (
          <form onSubmit={(e) => { e.preventDefault(); onSignup(signupForm); }} className="form-stack">
            <h3>Join CampusPool</h3>
            <p className="tab-desc">Register to find safe commutes between college and residential hubs.</p>
            <Field label="Full Name" value={signupForm.name} onChange={(val) => setSignupForm({ ...signupForm, name: val })} required />
            <label className="input-group">
              <span>College Email Address</span>
              <input type="email" value={signupForm.email} onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })} placeholder="name@sit.ac.in" required />
            </label>
            <label className="input-group">
              <span>Gender</span>
              <select value={signupForm.gender} onChange={(e) => setSignupForm({ ...signupForm, gender: e.target.value })}>
                <option>Woman</option>
                <option>Man</option>
                <option>Prefer not to say</option>
              </select>
            </label>
            <Field label="Trusted Emergency Contact" value={signupForm.guardianPhone} onChange={(val) => setSignupForm({ ...signupForm, guardianPhone: val })} required />
            <button type="submit" className="btn-submit">Submit Registration</button>
          </form>
        )}
      </div>
    </div>
  );
}

// ==========================================
// Authenticated Dashboard Layout
// ==========================================
function Dashboard(props) {
  return (
    <div className="dashboard-grid">
      <aside className="sidebar-menu">
        <div className="sidebar-brand">
          <div className="brand-badge">CP</div>
          <div>
            <h4>CampusPool</h4>
            <span>Bangalore Commute</span>
          </div>
        </div>
        <nav className="sidebar-links">
          {dashboardSections.map((sec) => (
            <button
              key={sec.id}
              className={`sidebar-nav-btn ${props.activeSection === sec.id ? "active" : ""}`}
              onClick={() => props.setActiveSection(sec.id)}
            >
              <Icon name={sec.icon} className="sidebar-btn-icon" />
              <span>{sec.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-profile-summary">
            <div className="avatar-circle">
              {props.currentUser.name.charAt(0)}
            </div>
            <div className="user-meta">
              <h6>{props.currentUser.name}</h6>
              <span>{props.currentUser.college.split(" ")[0]}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={props.onLogout}>
            <Icon name="logout" className="logout-icon" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <section className="dashboard-main-area">
        <TopBar user={props.currentUser} notifications={props.notifications} stats={props.stats} />
        <div className="dashboard-view-wrapper">
          {props.activeSection === "find" && <FindRideView {...props} />}
          {props.activeSection === "offer" && <OfferRideView {...props} />}
          {props.activeSection === "requests" && <RequestsView {...props} />}
          {props.activeSection === "safety" && <SafetyView {...props} />}
          {props.activeSection === "payments" && <PaymentsView {...props} />}
          {props.activeSection === "impact" && <ImpactView {...props} />}
        </div>
      </section>
    </div>
  );
}

// ==========================================
// Dashboard Header (TopBar)
// ==========================================
function TopBar({ user, notifications, stats }) {
  return (
    <header className="dashboard-top-bar">
      <div className="topbar-welcome">
        <span>Verified student profile</span>
        <h3>{user.name}</h3>
      </div>
      <div className="topbar-pills">
        <div className="header-stat-pill trust">
          <Icon name="shield" className="pill-icon" />
          <div>
            <span>Trust Score</span>
            <strong>{user.trustScore} / 100</strong>
          </div>
        </div>
        <div className="header-stat-pill alert">
          <Icon name="bell" className="pill-icon" />
          <div>
            <span>Alerts</span>
            <strong>{notifications.length} Unread</strong>
          </div>
        </div>
        <div className="header-stat-pill open-seats">
          <Icon name="car" className="pill-icon" />
          <div>
            <span>Seats Active</span>
            <strong>{stats?.seatsAvailable ?? "0"}</strong>
          </div>
        </div>
      </div>
    </header>
  );
}

// ==========================================
// Dashboard Views
// ==========================================
function FindRideView({ search, setSearch, onSearch, rides, hubs, onRequestRide }) {
  return (
    <div className="dashboard-two-col">
      <div className="column-primary">
        <div className="card-panel">
          <div className="panel-title-area">
            <Icon name="compass" className="panel-header-icon" />
            <div>
              <h3>Book a Campus Ride</h3>
              <p>Match your commute schedules with verified student drivers.</p>
            </div>
          </div>
          <RideSearchForm search={search} setSearch={setSearch} onSubmit={onSearch} compact={false} />
        </div>

        <div className="rides-list-heading">
          <h4>Commutes passing Jayanagar / Mysore Road</h4>
          <span>{rides.length} matching rides found</span>
        </div>

        <div className="ride-cards-container">
          {rides.length ? rides.map((ride) => (
            <RideCard key={ride.id} ride={ride} onBook={() => onRequestRide(ride)} />
          )) : <EmptyState title="No matching rides found" text="Try widening your boarding location search or using a nearby pickup hub." />}
        </div>
      </div>

      <div className="column-sidebar">
        <div className="card-panel map-panel-aside">
          <h3>Commute Route Tracker</h3>
          <MockMap from={search.from} to={search.to} />
        </div>

        <div className="card-panel">
          <h3>Popular Campus Hubs</h3>
          <p className="panel-subtitle">Frequent boarding and dropoff locations.</p>
          <div className="hubs-grid-menu">
            {hubs.slice(0, 5).map((hub) => (
              <button 
                key={hub.id} 
                className="hub-select-btn"
                onClick={() => setSearch({ ...search, from: hub.area, college: hub.college })}
              >
                <div className="hub-info-text">
                  <strong>{hub.name}</strong>
                  <span>{hub.college}</span>
                </div>
                <Icon name="arrowRight" className="hub-select-arrow" />
              </button>
            ))}
          </div>
        </div>

        <div className="card-panel">
          <h3>Safety Filters</h3>
          <label className="input-group">
            <span>Gender Preference</span>
            <select value={search.gender} onChange={(e) => setSearch({ ...search, gender: e.target.value })}>
              <option>All</option>
              <option>Any</option>
              <option>Women only</option>
            </select>
          </label>
        </div>
      </div>
    </div>
  );
}

function OfferRideView({ currentUser, rideForm, setRideForm, onCreateRide, onVerify, onCalculateFare, fareQuote }) {
  const canDrive = currentUser.studentId.status === "Verified" && currentUser.driversLicense.status === "Verified";
  
  return (
    <div className="dashboard-two-col">
      <div className="column-primary">
        <div className="card-panel">
          <div className="panel-title-area">
            <Icon name="car" className="panel-header-icon" />
            <div>
              <h3>Offer Empty Seats</h3>
              <p>Post a one-time or recurring route between campus and boarding hubs.</p>
            </div>
          </div>
          
          <form onSubmit={onCreateRide} className="form-double-grid">
            <Field label="Pickup Location" value={rideForm.from} onChange={(val) => setRideForm({ ...rideForm, from: val })} required />
            <Field label="Destination Campus" value={rideForm.to} onChange={(val) => setRideForm({ ...rideForm, to: val })} required />
            <Field label="Departure Date" type="date" value={rideForm.date} onChange={(val) => setRideForm({ ...rideForm, date: val })} required />
            <Field label="Departure Time" type="time" value={rideForm.time} onChange={(val) => setRideForm({ ...rideForm, time: val })} required />
            <Field label="Passenger Seats" type="number" value={rideForm.seats} onChange={(val) => setRideForm({ ...rideForm, seats: val })} required />
            <Field label="Distance (KM)" type="number" value={rideForm.distanceKm} onChange={(val) => setRideForm({ ...rideForm, distanceKm: val })} required />
            <Field label="Fuel Cost (per KM)" type="number" value={rideForm.fuelCostPerKm} onChange={(val) => setRideForm({ ...rideForm, fuelCostPerKm: val })} required />
            
            <label className="input-group">
              <span>Co-commuter Gender Preference</span>
              <select value={rideForm.genderPref} onChange={(e) => setRideForm({ ...rideForm, genderPref: e.target.value })}>
                <option>Any</option>
                <option>Women only</option>
              </select>
            </label>
            <Field label="Vehicle Model" value={rideForm.vehicle} onChange={(val) => setRideForm({ ...rideForm, vehicle: val })} required />
            <Field label="Meeting Specifics" value={rideForm.meetingPoint} onChange={(val) => setRideForm({ ...rideForm, meetingPoint: val })} required />
            
            <div className="form-actions-full">
              <button type="button" className="btn-secondary" onClick={onCalculateFare}>
                Estimate Share Cost
              </button>
              <button type="submit" className="btn-primary" disabled={!canDrive}>
                Publish Route
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="column-sidebar">
        <div className="card-panel">
          <h3>Verification Status</h3>
          <p className="panel-subtitle">For driver safety regulations, both documents must be approved.</p>
          <div className="verification-rows-stack">
            <VerificationRow label="Student ID Checked" status={currentUser.studentId.status} onVerify={() => onVerify("student")} />
            <VerificationRow label="Driver's License Approved" status={currentUser.driversLicense.status} onVerify={() => onVerify("license")} />
          </div>
          {!canDrive && (
            <div className="danger-alert-notice">
              <Icon name="shield" className="notice-icon" />
              <span>You must verify your ID and driver license to accept passengers.</span>
            </div>
          )}
        </div>

        <div className="card-panel">
          <h3>Fare Calculator Preview</h3>
          {fareQuote ? (
            <div className="calculator-result-card animate-scale-up">
              <span className="rec-fare-label">Suggested Share price per passenger:</span>
              <strong className="rec-price">Rs {fareQuote.recommendedFare}</strong>
              <div className="fare-subinfo">
                <span>Distance: {fareQuote.distanceKm} km</span>
                <span>Max splits: {fareQuote.seats} seats</span>
              </div>
              <small className="calc-formula">Formula: {fareQuote.formula}</small>
            </div>
          ) : (
            <EmptyState title="Fare uncalculated" text="Fill the route details and click 'Estimate Share Cost' to see the recommended split." />
          )}
        </div>

        <div className="card-panel map-panel-aside">
          <h3>Offering Route</h3>
          <MockMap from={rideForm.from} to={rideForm.to} />
        </div>
      </div>
    </div>
  );
}

function RequestsView(props) {
  const selected = props.requests.find((req) => req.id === props.selectedRequestId) || props.requests[0];
  const selectedRide = selected ? props.allRides.find((r) => r.id === selected.rideId) : null;

  return (
    <div className="dashboard-two-col">
      <div className="column-primary">
        <div className="card-panel">
          <div className="panel-title-area">
            <Icon name="message" className="panel-header-icon" />
            <div>
              <h3>Active Ride Requests</h3>
              <p>Manage, view, and process bookings you have requested or received.</p>
            </div>
          </div>
          <div className="requests-stack">
            {props.requests.length ? props.requests.map((request) => (
              <RequestCard key={request.id} request={request} {...props} />
            )) : <EmptyState title="No active requests" text="Requests you make or receive will list here. Make a booking request to start." />}
          </div>
        </div>
      </div>

      <div className="column-sidebar">
        <div className="card-panel chat-card-panel">
          <h3>In-App Messenger</h3>
          <p className="panel-subtitle">Coordinates chat with the match partner.</p>
          
          {selected ? (
            <div className="chat-interface-wrapper">
              <div className="chat-header-banner">
                <div className="avatar-circle-sm">
                  {selected.student.charAt(0)}
                </div>
                <div>
                  <strong>{selected.student}</strong>
                  <span>Request Status: {selected.status}</span>
                </div>
              </div>

              <div className="chat-messages-container">
                {props.chatMessages.length ? props.chatMessages.map((msg) => {
                  const isMe = msg.senderId === props.currentUser.id;
                  return (
                    <div key={msg.id} className={`chat-message-bubble ${isMe ? "me" : "them"}`}>
                      <p>{msg.text}</p>
                      <span className="chat-time">Sent</span>
                    </div>
                  );
                }) : <span className="no-chat-hint">No messages exchanged yet. Send a boarding point coordinate question below.</span>}
              </div>

              <div className="chat-input-row">
                <textarea 
                  value={props.chatDraft} 
                  onChange={(e) => props.setChatDraft(e.target.value)} 
                  placeholder="Ask driver about pickup points..."
                  rows="2"
                />
                <button className="btn-send-message" onClick={props.onSendChat}>
                  Send
                </button>
              </div>
            </div>
          ) : (
            <EmptyState title="Select a request" text="Click 'Open Chat' on a ride card request to load the coordinator conversation." />
          )}
        </div>

        {selectedRide && (
          <div className="card-panel map-panel-aside">
            <h3>Request Route Path</h3>
            <MockMap from={selectedRide.from} to={selectedRide.to} />
          </div>
        )}
      </div>
    </div>
  );
}

function RequestCard({ request, allRides, currentUser, onLoadChat, onAcceptRequest, onStartTrip }) {
  const ride = allRides.find((item) => item.id === request.rideId);
  const isDriver = ride?.driverId === currentUser.id;
  
  return (
    <article className="req-row-card">
      <div className="req-card-main-info">
        <div className="req-col">
          <span className="req-id">Request ID #{request.id}</span>
          <strong className="req-desc">{ride?.from} to {ride?.to}</strong>
          <span className="req-student-label">
            <Icon name="user" className="req-icon-inline" /> {isDriver ? `Commuter: ${request.student}` : `Driver: ${ride?.driverName}`}
          </span>
        </div>
        <div className="req-col status-price">
          <span className="req-price-display">Rs {request.fare}</span>
          <span className={`status-pill-badge ${request.status.toLowerCase()}`}>
            {request.status}
          </span>
        </div>
      </div>
      
      <div className="req-actions-bar">
        <button className="btn-secondary-sm" onClick={() => onLoadChat(request.id)}>
          <Icon name="message" className="btn-icon" /> Chat Coordinates
        </button>
        {request.status === "Requested" && isDriver && (
          <button className="btn-primary-sm" onClick={() => onAcceptRequest(request.id)}>
            <Icon name="check" className="btn-icon" /> Accept Commuter
          </button>
        )}
        {request.status === "Requested" && !isDriver && (
          <span className="status-note">Awaiting driver approval</span>
        )}
        {request.status === "Accepted" && (
          <button className="btn-primary-sm green-btn" onClick={() => onStartTrip(request.id)}>
            <Icon name="car" className="btn-icon" /> Start Journey
          </button>
        )}
        {request.status === "Completed" && (
          <span className="status-note success"><Icon name="check" className="req-icon-inline" /> Trip Completed</span>
        )}
      </div>
    </article>
  );
}

function SafetyView({ currentUser, onVerify, onSOS, notifications, activeTripId }) {
  return (
    <div className="dashboard-two-col">
      <div className="column-primary">
        <div className="card-panel">
          <div className="panel-title-area">
            <Icon name="shield" className="panel-header-icon" />
            <div>
              <h3>Safety &amp; Trust Center</h3>
              <p>CampusPool integrates mandatory academic allowlists and direct emergency actions.</p>
            </div>
          </div>

          <div className="safety-grid-credentials">
            <div className="safety-cred-card">
              <span>Allowlist Domain Verification</span>
              <strong>{currentUser.emailVerified ? "Academic Email Verified" : "Verification Pending"}</strong>
              <small>{currentUser.email}</small>
            </div>
            <div className="safety-cred-card">
              <span>Campus Identity card</span>
              <strong>{currentUser.studentId.status === "Verified" ? "ID Checked & Approved" : "Upload ID for check"}</strong>
              <small>Status: {currentUser.studentId.status}</small>
            </div>
            <div className="safety-cred-card">
              <span>Driving Permit Status</span>
              <strong>{currentUser.driversLicense.status === "Verified" ? "License Checked" : "Upload driving license"}</strong>
              <small>Status: {currentUser.driversLicense.status}</small>
            </div>
            <div className="safety-cred-card">
              <span>Emergency Shared Guardian</span>
              <strong>{currentUser.trustedContacts?.[0]?.phone || "No contact linked"}</strong>
              <small>{currentUser.trustedContacts?.[0]?.name || "Add contact"}</small>
            </div>
          </div>

          <div className="emergency-sos-action-block">
            <div className="sos-desc">
              <h4>SOS Emergency Broadcast</h4>
              <p>
                Triggering the SOS alert alerts your listed guardian contact and notifies the CampusPool campus supervisor database with your coordinates.
              </p>
            </div>
            <button className="btn-sos-trigger" onClick={onSOS} disabled={!activeTripId}>
              <Icon name="shield" className="sos-icon-btn" />
              <span>TRIGGER EMERGENCY SOS</span>
            </button>
          </div>

          <div className="safety-quick-doc-actions">
            <span>Fast test simulation triggers:</span>
            <div className="action-row-buttons">
              <button className="btn-secondary" onClick={() => onVerify("student")}>Mock Student ID Approval</button>
              <button className="btn-secondary" onClick={() => onVerify("license")}>Mock license Approval</button>
            </div>
          </div>
        </div>
      </div>

      <div className="column-sidebar">
        <div className="card-panel">
          <h3>Emergency Logs</h3>
          <p className="panel-subtitle">Recent coordinate alerts and verification reports.</p>
          <NotificationList notifications={notifications.filter((item) => ["sos", "trip", "verification"].includes(item.type))} />
        </div>
      </div>
    </div>
  );
}

function PaymentsView({ requests, allRides, currentUser, onCreatePayment, lastPayment }) {
  const request = requests.find((item) => item.status === "Accepted") || requests[0];
  const ride = request ? allRides.find((item) => item.id === request.rideId) : null;

  return (
    <div className="dashboard-two-col">
      <div className="column-primary">
        <div className="card-panel">
          <div className="panel-title-area">
            <Icon name="wallet" className="panel-header-icon" />
            <div>
              <h3>Commute Settlement &amp; Billing</h3>
              <p>CampusPool calculates split expenses automatically. Hand off payment seamlessly.</p>
            </div>
          </div>

          {request ? (
            <div className="commute-invoice-bill animate-scale-up">
              <div className="bill-main-header">
                <div>
                  <span>Pending Invoice Match</span>
                  <strong>Rs {request.fare}</strong>
                </div>
                <div className="bill-receipt-badge">UPI Split</div>
              </div>
              <div className="bill-detail-list">
                <div className="bill-row">
                  <span>From location</span>
                  <strong>{ride?.from}</strong>
                </div>
                <div className="bill-row">
                  <span>To Campus</span>
                  <strong>{ride?.to}</strong>
                </div>
                <div className="bill-row">
                  <span>Student Driver</span>
                  <strong>{ride?.driverName}</strong>
                </div>
              </div>
              
              <div className="invoice-actions">
                <button className="btn-primary" onClick={onCreatePayment}>
                  {currentUser.payLaterEligible ? "Use Pay Later Trust Balance" : "Generate Deep-Link UPI QR"}
                </button>
              </div>

              {lastPayment && (
                <div className="payment-receipt-block animate-scale-up">
                  <div className="qr-simulated-box">
                    {/* SVG placeholder for QR Code */}
                    <svg viewBox="0 0 100 100" width="80" height="80">
                      <rect width="100" height="100" fill="#f8fafc" />
                      <rect x="10" y="10" width="25" height="25" fill="#09090b" />
                      <rect x="65" y="10" width="25" height="25" fill="#09090b" />
                      <rect x="10" y="65" width="25" height="25" fill="#09090b" />
                      <rect x="40" y="40" width="20" height="20" fill="#10b981" />
                      <rect x="75" y="75" width="15" height="15" fill="#09090b" />
                    </svg>
                    <span>UPI Split QR generated</span>
                  </div>
                  <div className="receipt-text">
                    <span className="pay-status-pill">{lastPayment.status}</span>
                    <small>Payment target link: {lastPayment.upiLink}</small>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState title="No active invoices found" text="Book a ride. Once it is approved, fare splits and payment gateways will display here." />
          )}
        </div>
      </div>

      <div className="column-sidebar">
        <div className="card-panel holographic-card-container">
          <div className="holographic-trust-card">
            <div className="card-top">
              <span>CampusPool Trust Card</span>
              <div className="chip-logo"></div>
            </div>
            <div className="card-mid">
              <strong>{currentUser.name}</strong>
              <span>Academic Allowlist commuter</span>
            </div>
            <div className="card-bottom">
              <div>
                <small>Trust Rating</small>
                <strong>{currentUser.trustScore} / 100</strong>
              </div>
              <div>
                <small>Pay Later Access</small>
                <strong>{currentUser.payLaterEligible ? "Eligible" : "Not Eligible"}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ImpactView({ carbon, history, notifications, waitlists, currentUser }) {
  return (
    <div className="dashboard-two-col">
      <div className="column-primary">
        <div className="card-panel">
          <div className="panel-title-area">
            <Icon name="leaf" className="panel-header-icon" />
            <div>
              <h3>Commute Carbon Contribution</h3>
              <p>Track metrics saved by sharing trips instead of driving single vehicles.</p>
            </div>
          </div>

          <div className="carbon-badge-showcase">
            <div className="carbon-leaf-graphic">
              <Icon name="leaf" className="big-leaf" />
              <span>CO2 Status badge</span>
              <strong>{carbon?.badge || "Bronze Commuter"}</strong>
            </div>
            <div className="carbon-numbers">
              <span>Estimated Personal Carbon Offsets</span>
              <strong>{carbon?.monthlyKg ?? currentUser.monthlyCo2SavedKg} kg CO2</strong>
              <p>{carbon?.message || "Complete your first campus trip to launch carbon calculation indices."}</p>
              <div className="progress-bar-container large">
                <div className="progress-bar-fill green" style={{ width: `${carbon?.gamifiedProgress || 24}%` }}></div>
              </div>
              <span>Progress toward Silver Commuter badge: {carbon?.gamifiedProgress || 24}%</span>
            </div>
          </div>
        </div>

        <div className="card-panel">
          <h3>Your Campus Trip History</h3>
          <p className="panel-subtitle">Past and pending logs of boarding rides.</p>
          <div className="history-stack-rows">
            {history.length ? history.map((item, index) => (
              <article key={index} className="history-row-card">
                <div>
                  <strong>{item.ride.from} to {item.ride.to}</strong>
                  <span>Role: {item.role} &bull; Status: {item.request.status}</span>
                </div>
                <Icon name="check" className="history-completed-icon" />
              </article>
            )) : <EmptyState title="No commute logs" text="No previous ride records found. Book a seat to populate trip history logs." />}
          </div>
        </div>
      </div>

      <div className="column-sidebar">
        <div className="card-panel">
          <h3>Active Notification Stream</h3>
          <NotificationList notifications={notifications} />
        </div>

        <div className="card-panel">
          <h3>Route Waitlists</h3>
          <p className="panel-subtitle">Schedules you joined that are full.</p>
          <div className="waitlist-logs-stack">
            {waitlists.length ? waitlists.slice(0, 4).map((item) => (
              <article key={item.id} className="waitlist-item">
                <div className="wl-info">
                  <strong>{item.route}</strong>
                  <span>Position queue: #{item.position}</span>
                </div>
                <span className="waitlist-status-badge">{item.status}</span>
              </article>
            )) : <span className="no-waitlists-label">You are currently not queued in any waitlist routes.</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// Base Subcomponents & Helpers
// ==========================================
function RideSearchForm({ search, setSearch, onSubmit, compact }) {
  return (
    <form className={`ride-search-grid-layout ${compact ? "compact" : ""}`} onSubmit={onSubmit}>
      <label className="input-group">
        <span>Pickup boarding</span>
        <div className="input-with-icon">
          <Icon name="map" className="inner-field-icon" />
          <input type="text" value={search.from} onChange={(e) => setSearch({ ...search, from: e.target.value })} required />
        </div>
      </label>
      
      <label className="input-group">
        <span>Destination Hub</span>
        <div className="input-with-icon">
          <Icon name="map" className="inner-field-icon" />
          <input type="text" value={search.to} onChange={(e) => setSearch({ ...search, to: e.target.value })} required />
        </div>
      </label>

      <label className="input-group">
        <span>Journey Date</span>
        <div className="input-with-icon">
          <Icon name="calendar" className="inner-field-icon" />
          <input type="date" value={search.date} onChange={(e) => setSearch({ ...search, date: e.target.value })} required />
        </div>
      </label>

      <label className="input-group">
        <span>Commuting College</span>
        <select value={search.college} onChange={(e) => setSearch({ ...search, college: e.target.value })}>
          {colleges.map((c) => <option key={c}>{c}</option>)}
        </select>
      </label>

      <label className="input-group">
        <span>Seats Requested</span>
        <div className="input-with-icon">
          <Icon name="users" className="inner-field-icon" />
          <input type="number" min="1" max="4" value={search.passengers} onChange={(e) => setSearch({ ...search, passengers: e.target.value })} required />
        </div>
      </label>

      <button type="submit" className="btn-search-trigger">
        <Icon name="search" className="btn-icon" />
        <span>Search</span>
      </button>
    </form>
  );
}

function RideCard({ ride, onBook }) {
  const seatsLeft = ride.availableSeats ?? ride.seats;
  return (
    <article className="ride-offer-ticket">
      <div className="ticket-body">
        <div className="ticket-header-row">
          <div className="driver-profile-mini">
            <div className="avatar-circle-sm font-bold">
              {ride.driverName.charAt(0)}
            </div>
            <div>
              <strong>{ride.driverName}</strong>
              <div className="driver-rating-row">
                <Icon name="star" className="star-icon" />
                <span>{ride.rating} Rating &bull; {ride.college.split(" ")[0]}</span>
              </div>
            </div>
          </div>
          <div className="ticket-price-badge">
            <span>Per Seat</span>
            <strong>Rs {ride.price}</strong>
          </div>
        </div>

        <div className="ticket-route-timeline">
          <div className="timeline-node">
            <span className="dot green"></span>
            <div>
              <span>Pickup: {ride.from}</span>
            </div>
          </div>
          <div className="timeline-node">
            <span className="dot red"></span>
            <div>
              <span>Destination: {ride.to}</span>
            </div>
          </div>
        </div>

        <div className="ticket-meta-details">
          <div className="meta-block">
            <Icon name="clock" className="meta-icon" />
            <span>Departure: {ride.time} ({ride.date})</span>
          </div>
          <div className="meta-block">
            <Icon name="users" className="meta-icon" />
            <span>Seats left: {seatsLeft} / {ride.seats}</span>
          </div>
          {ride.overlapScore && (
            <div className="meta-block overlap">
              <Icon name="compass" className="meta-icon" />
              <span>{Math.round(ride.overlapScore * 100)}% route overlap</span>
            </div>
          )}
        </div>

        <p className="route-summary-note">{ride.routeSummary}</p>
      </div>

      <div className="ticket-footer-action-row">
        <div className="ticket-tag-pills">
          {(ride.tags || []).slice(0, 3).map((tag) => (
            <span key={tag} className="tag-chip">{tag}</span>
          ))}
          {ride.recurring?.enabled && <span className="tag-chip recurring">Recurring Route</span>}
        </div>
        <button className="btn-request-seat" onClick={onBook}>
          {seatsLeft === 0 ? "Join Waitlist" : "Book Seat"}
        </button>
      </div>
    </article>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="card-panel">
      <div className="panel-title-area">
        <h3>{title}</h3>
        {subtitle && <p className="panel-subtitle">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Feature({ title, text }) {
  return (
    <article className="feat-card">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

function Info({ title, text }) {
  return (
    <article className="safety-cred-card">
      <span>{title}</span>
      <strong>{text}</strong>
    </article>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat-value-card">
      <span className="stat-title">{label}</span>
      <strong className="stat-num">{value}</strong>
    </div>
  );
}

function Badge({ label, value }) {
  return (
    <div className="header-stat-pill">
      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}

function VerificationRow({ label, status, onVerify }) {
  const isVerified = status === "Verified";
  return (
    <div className="verification-row-widget">
      <div>
        <strong>{label}</strong>
        <span className={`status-text ${status.toLowerCase()}`}>{status}</span>
      </div>
      {!isVerified && (
        <button className="btn-secondary-sm" onClick={onVerify}>
          Approve check
        </button>
      )}
    </div>
  );
}

function NotificationList({ notifications }) {
  if (!notifications.length) {
    return <EmptyState title="No active notifications" text="Updates from matches, chat logs, or verification checks will display here." />;
  }
  return (
    <div className="notification-logs-stack">
      {notifications.slice(0, 6).map((notif) => (
        <article key={notif.id} className="notification-log-item">
          <strong>{notif.title}</strong>
          <p>{notif.body}</p>
        </article>
      ))}
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="empty-state-card">
      <Icon name="compass" className="empty-state-icon" />
      <strong>{title}</strong>
      <span>{text}</span>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="input-group">
      <span>{label}</span>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} />
    </label>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
