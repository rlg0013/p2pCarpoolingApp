const { useEffect, useMemo, useState } = React;

const colleges = [
  "RV College of Engineering",
  "Christ University",
  "PES University",
  "MS Ramaiah Institute of Technology",
  "BMS College of Engineering",
  "Dayananda Sagar University"
];

const defaultRide = {
  driverId: 1,
  driverName: "Aarav S",
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

function App() {
  const [rides, setRides] = useState([]);
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("All");
  const [activeTab, setActiveTab] = useState("rides");
  const [rideForm, setRideForm] = useState(defaultRide);
  const [toast, setToast] = useState("Functional prototype ready: backend features are exposed in the Feature Lab");
  const [labOutput, setLabOutput] = useState(null);

  const filtered = useMemo(() => {
    return rides.filter((ride) => {
      const tags = Array.isArray(ride.tags) ? ride.tags.join(" ") : "";
      const haystack = `${ride.driverName} ${ride.college} ${ride.from} ${ride.to} ${tags} ${ride.routeSummary}`.toLowerCase();
      const queryMatch = !query || haystack.includes(query.toLowerCase());
      const genderMatch = gender === "All" || ride.genderPref === gender;
      return queryMatch && genderMatch;
    });
  }, [rides, query, gender]);

  async function loadData() {
    const [ridesResponse, statsResponse, studentsResponse] = await Promise.all([
      fetch("/api/rides"),
      fetch("/api/stats"),
      fetch("/api/students")
    ]);
    setRides(await ridesResponse.json());
    setStats(await statsResponse.json());
    setStudents(await studentsResponse.json());
  }

  useEffect(() => {
    loadData().catch(() => setToast("Could not reach the Go API"));
  }, []);

  async function apiCall(label, path, body, method = "POST") {
    const response = await fetch(path, {
      method,
      headers: method === "GET" ? undefined : { "Content-Type": "application/json" },
      body: method === "GET" ? undefined : JSON.stringify(body)
    });
    const text = await response.text();
    let parsed = text;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = { error: text };
    }
    setLabOutput({ label, ok: response.ok, status: response.status, data: parsed });
    if (!response.ok) {
      setToast(`${label} failed: ${typeof parsed === "string" ? parsed : parsed.error || response.status}`);
      return null;
    }
    await loadData();
    setToast(`${label} completed`);
    return parsed;
  }

  async function bookRide(ride) {
    const response = await apiCall("Ride request", "/api/ride-requests", {
      rideId: ride.id,
      passengerId: 2,
      seatCount: 1,
      message: "Can I join from the nearest metro gate?"
    });
    if (response?.status === "Waitlisted") {
      setToast(`Ride full. Added to waitlist at position ${response.position}.`);
    }
  }

  async function createRide(event) {
    event.preventDefault();
    const created = await apiCall("Create recurring ride", "/api/rides", {
      ...rideForm,
      driverId: Number(rideForm.driverId),
      seats: Number(rideForm.seats),
      distanceKm: Number(rideForm.distanceKm),
      fuelCostPerKm: Number(rideForm.fuelCostPerKm)
    });
    if (created) {
      setActiveTab("rides");
    }
  }

  function updateForm(key, value) {
    setRideForm((current) => ({ ...current, [key]: value }));
  }

  return (
    <main>
      <header className="app-header">
        <nav>
          <div className="brand">
            <span className="brand-mark">CP</span>
            <span>CampusPool Bangalore</span>
          </div>
          <div className="nav-actions">
            <button className={activeTab === "rides" ? "active" : ""} onClick={() => setActiveTab("rides")}>Find rides</button>
            <button className={activeTab === "offer" ? "active" : ""} onClick={() => setActiveTab("offer")}>Offer ride</button>
            <button className={activeTab === "lab" ? "active" : ""} onClick={() => setActiveTab("lab")}>Feature Lab</button>
            <button className={activeTab === "safety" ? "active" : ""} onClick={() => setActiveTab("safety")}>Safety</button>
          </div>
        </nav>

        <section className="hero">
          <div>
            <p className="eyebrow">College-only carpooling prototype</p>
            <h1>Function-first carpooling backend for Bangalore students.</h1>
            <p className="hero-copy">
              Auth, trust verification, route matching, requests, chat, live trips, payments, ratings, waitlists, notifications, and carbon tracking are all API-backed.
            </p>
            <div className="hero-actions">
              <button onClick={() => setActiveTab("rides")}>Browse rides</button>
              <button className="secondary" onClick={() => setActiveTab("lab")}>Test features</button>
            </div>
          </div>
          <div className="route-panel">
            <div className="map-line">
              <span>Jayanagar</span>
              <strong />
              <span>RVCE</span>
            </div>
            <div className="trip-card compact">
              <span>Feature coverage</span>
              <strong>{stats?.students ?? "--"} students · {stats?.pendingRequests ?? 0} requests</strong>
              <small>{stats?.monthlyCo2SavedKg?.toFixed?.(1) ?? "--"} kg CO2 saved this month</small>
            </div>
          </div>
        </section>
      </header>

      <section className="stats-grid">
        <Stat label="Active rides" value={stats?.activeRides ?? "--"} />
        <Stat label="Seats open" value={stats?.seatsAvailable ?? "--"} />
        <Stat label="Requests" value={stats?.bookings ?? "--"} />
        <Stat label="CO2 saved" value={`${stats?.carbonSavedKg?.toFixed?.(1) ?? "--"} kg`} />
      </section>

      {toast && <div className="toast">{toast}</div>}

      {activeTab === "rides" && (
        <section className="workspace">
          <aside className="filters">
            <label>
              Search route or college
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Koramangala, PES, metro..." />
            </label>
            <label>
              Ride preference
              <select value={gender} onChange={(event) => setGender(event.target.value)}>
                <option>All</option>
                <option>Any</option>
                <option>Women only</option>
              </select>
            </label>
            <div className="profile-card">
              <strong>Demo student</strong>
              <span>RVCE · college email verified</span>
              <span>Pay later enabled · trust score 86</span>
            </div>
          </aside>

          <div className="ride-list">
            {filtered.map((ride) => (
              <RideCard key={ride.id} ride={ride} onBook={() => bookRide(ride)} />
            ))}
          </div>
        </section>
      )}

      {activeTab === "offer" && (
        <section className="form-shell">
          <form onSubmit={createRide} className="ride-form">
            <h2>Offer a recurring ride</h2>
            <div className="form-grid">
              <label>
                Driver
                <select value={rideForm.driverId} onChange={(event) => updateForm("driverId", event.target.value)}>
                  {students.filter((student) => student.driversLicense.status === "Verified").map((student) => (
                    <option key={student.id} value={student.id}>{student.name}</option>
                  ))}
                </select>
              </label>
              <label>
                College
                <select value={rideForm.college} onChange={(event) => updateForm("college", event.target.value)}>
                  {colleges.map((college) => <option key={college}>{college}</option>)}
                </select>
              </label>
              <Field label="Pickup" value={rideForm.from} onChange={(value) => updateForm("from", value)} />
              <Field label="Destination" value={rideForm.to} onChange={(value) => updateForm("to", value)} />
              <Field label="Date" type="date" value={rideForm.date} onChange={(value) => updateForm("date", value)} />
              <Field label="Time" type="time" value={rideForm.time} onChange={(value) => updateForm("time", value)} />
              <Field label="Seats" type="number" value={rideForm.seats} onChange={(value) => updateForm("seats", value)} />
              <Field label="Distance km" type="number" value={rideForm.distanceKm} onChange={(value) => updateForm("distanceKm", value)} />
              <Field label="Fuel cost/km" type="number" value={rideForm.fuelCostPerKm} onChange={(value) => updateForm("fuelCostPerKm", value)} />
              <label>
                Preference
                <select value={rideForm.genderPref} onChange={(event) => updateForm("genderPref", event.target.value)}>
                  <option>Any</option>
                  <option>Women only</option>
                </select>
              </label>
              <Field label="Vehicle" value={rideForm.vehicle} onChange={(value) => updateForm("vehicle", value)} />
              <Field label="Meeting point" value={rideForm.meetingPoint} onChange={(value) => updateForm("meetingPoint", value)} />
            </div>
            <button type="submit">Publish verified ride</button>
          </form>
        </section>
      )}

      {activeTab === "lab" && (
        <FeatureLab apiCall={apiCall} labOutput={labOutput} />
      )}

      {activeTab === "safety" && (
        <section className="safety-grid">
          <Info title="College verification" text="Signup rejects non-allowlisted domains and marks accepted college emails as verified." />
          <Info title="Document trust" text="Student ID and driver's license checks update verification status, trust score, and pay-later eligibility." />
          <Info title="Route overlap" text="Matching compares route points, not only exact pickup and drop text." />
          <Info title="Protected chat" text="Messages block phone-number sharing before confirmation." />
          <Info title="Live ride safety" text="Accepted rides can start trips, push locations, share trusted contacts, and trigger SOS." />
          <Info title="Carbon gamification" text="Completed trips update monthly and lifetime CO2 savings with badges." />
        </section>
      )}
    </main>
  );
}

function FeatureLab({ apiCall, labOutput }) {
  async function fullFlow() {
    const request = await apiCall("Create ride request", "/api/ride-requests", {
      rideId: 1,
      passengerId: 2,
      seatCount: 1,
      message: "I can join from Jayanagar metro."
    });
    if (!request?.id) return;

    await apiCall("Send pre-confirmation chat", "/api/chat", {
      requestId: request.id,
      senderId: 2,
      text: "Is Gate 2 fine? I will not share my phone here."
    });
    await apiCall("Accept request", `/api/ride-requests/${request.id}/accept`, {});
    const trip = await apiCall("Start live trip", "/api/trips/start", { requestId: request.id });
    if (!trip?.id) return;

    await apiCall("Push live location", `/api/trips/${trip.id}/location`, {
      studentId: 2,
      lat: 12.925,
      lng: 77.5938,
      speedKph: 28
    });
    await apiCall("Create UPI payment", "/api/payments", {
      requestId: request.id,
      payerId: 2,
      receiverId: 1,
      payLater: true
    });
    await apiCall("Complete trip and save carbon", `/api/trips/${trip.id}/complete`, {});
    await apiCall("Rate driver", "/api/ratings", {
      rideId: 1,
      fromId: 2,
      toId: 1,
      role: "driver",
      score: 5,
      comment: "Safe and on time"
    });
    await apiCall("Carbon tracker", "/api/carbon?studentId=2", null, "GET");
  }

  return (
    <section className="lab-shell">
      <div className="lab-actions">
        <button onClick={() => apiCall("College email signup", "/api/auth/signup", {
          name: "Sneha R",
          email: "sneha@sit.ac.in",
          gender: "Woman",
          trustedContacts: [{ name: "Sneha Parent", phone: "+919900000099" }]
        })}>Signup with college email</button>
        <button onClick={() => apiCall("Student ID verification", "/api/verifications/student-id", {
          studentId: 2,
          documentId: "RVCE-ID-DEMO",
          approve: true
        })}>Verify student ID</button>
        <button onClick={() => apiCall("Driver license verification", "/api/verifications/license", {
          studentId: 2,
          documentId: "KA-DL-DEMO",
          approve: true
        })}>Verify license</button>
        <button onClick={() => apiCall("Route match", "/api/matches", {
          studentId: 2,
          college: "RV College of Engineering",
          from: "Jayanagar 4th Block",
          to: "RVCE Mysore Road"
        })}>Route-based matching</button>
        <button onClick={() => apiCall("Fare calculator", "/api/payments/calculate", {
          distanceKm: 14,
          fuelCostPerKm: 8.5,
          seats: 3
        })}>Auto fare calculator</button>
        <button onClick={() => apiCall("Waitlist", "/api/waitlists", {
          rideId: 4,
          studentId: 2,
          route: "Yeshwanthpur to MSRIT",
          college: "MS Ramaiah Institute of Technology"
        })}>Join waitlist</button>
        <button onClick={() => apiCall("Notifications", "/api/notifications?studentId=2", null, "GET")}>View notifications</button>
        <button onClick={() => apiCall("Ride history", "/api/history?studentId=2", null, "GET")}>Ride history</button>
        <button onClick={() => apiCall("SOS demo", "/api/trips/1/sos", {
          studentId: 2,
          message: "SOS test from prototype"
        })}>SOS test</button>
        <button onClick={fullFlow}>Run full request-to-carbon flow</button>
      </div>
      <pre className="lab-output">{JSON.stringify(labOutput ?? { hint: "Click a feature button to see the API response." }, null, 2)}</pre>
    </section>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RideCard({ ride, onBook }) {
  const seatsLeft = ride.availableSeats ?? ride.seats;
  return (
    <article className="ride-card">
      <div className="ride-top">
        <div>
          <h3>{ride.from} to {ride.to}</h3>
          <p>{ride.date} · {ride.time} · {ride.meetingPoint}</p>
        </div>
        <span className="price">Rs {ride.price}</span>
      </div>
      <div className="driver-row">
        <span>{ride.driverName}</span>
        <span>{ride.college}</span>
        <span>{ride.rating} rating</span>
      </div>
      <div className="route-note">{ride.routeSummary}</div>
      <div className="chips">
        {(ride.tags || []).map((tag) => <span key={tag}>{tag}</span>)}
        {ride.recurring?.enabled && <span>{ride.recurring.days.join(", ")} recurring</span>}
      </div>
      <div className="ride-bottom">
        <span>{seatsLeft} seats left · {ride.vehicle} · saves {ride.carbonSavedKg} kg CO2</span>
        <button onClick={onBook} disabled={seatsLeft === 0}>{seatsLeft === 0 ? "Join waitlist" : "Request seat"}</button>
      </div>
    </article>
  );
}

function Field({ label, value, onChange, type = "text" }) {
  return (
    <label>
      {label}
      <input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function Info({ title, text }) {
  return (
    <article className="info">
      <h3>{title}</h3>
      <p>{text}</p>
    </article>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
