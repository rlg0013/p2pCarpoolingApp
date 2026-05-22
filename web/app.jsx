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
  driverName: "You",
  college: "RV College of Engineering",
  from: "Jayanagar 4th Block",
  to: "RVCE Mysore Road",
  date: "2026-05-23",
  time: "08:00",
  seats: 2,
  price: 60,
  genderPref: "Any",
  vehicle: "Maruti Baleno",
  meetingPoint: "Metro gate",
  emergencyShared: true
};

function App() {
  const [rides, setRides] = useState([]);
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState("");
  const [gender, setGender] = useState("All");
  const [activeTab, setActiveTab] = useState("rides");
  const [rideForm, setRideForm] = useState(defaultRide);
  const [toast, setToast] = useState("Prototype ready: college-only rides around Bangalore");

  const filtered = useMemo(() => {
    return rides.filter((ride) => {
      const haystack = `${ride.driverName} ${ride.college} ${ride.from} ${ride.to} ${ride.tags.join(" ")}`.toLowerCase();
      const queryMatch = !query || haystack.includes(query.toLowerCase());
      const genderMatch = gender === "All" || ride.genderPref === gender;
      return queryMatch && genderMatch;
    });
  }, [rides, query, gender]);

  async function loadData() {
    const [ridesResponse, statsResponse] = await Promise.all([
      fetch("/api/rides"),
      fetch("/api/stats")
    ]);
    setRides(await ridesResponse.json());
    setStats(await statsResponse.json());
  }

  useEffect(() => {
    loadData().catch(() => setToast("Could not reach the Go API"));
  }, []);

  async function bookRide(ride) {
    const response = await fetch("/api/bookings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        rideId: ride.id,
        student: "Demo Student",
        college: "RV College of Engineering"
      })
    });

    if (!response.ok) {
      setToast("That ride is not available anymore");
      return;
    }

    await loadData();
    setToast(`Request sent to ${ride.driverName}. Safety contact and trip link are queued.`);
  }

  async function createRide(event) {
    event.preventDefault();
    const response = await fetch("/api/rides", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...rideForm,
        seats: Number(rideForm.seats),
        price: Number(rideForm.price)
      })
    });

    if (!response.ok) {
      setToast("Please add pickup, destination, and at least one seat");
      return;
    }

    const created = await response.json();
    await loadData();
    setActiveTab("rides");
    setToast(`Ride posted from ${created.from} to ${created.to}`);
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
            <button className={activeTab === "safety" ? "active" : ""} onClick={() => setActiveTab("safety")}>Safety</button>
          </div>
        </nav>

        <section className="hero">
          <div>
            <p className="eyebrow">College-only carpooling prototype</p>
            <h1>Match with verified students heading across Bangalore.</h1>
            <p className="hero-copy">
              Browse campus rides, split fares, request seats, and share live-trip safety signals from one student-focused dashboard.
            </p>
            <div className="hero-actions">
              <button onClick={() => setActiveTab("rides")}>Browse rides</button>
              <button className="secondary" onClick={() => setActiveTab("offer")}>Post a ride</button>
            </div>
          </div>
          <div className="route-panel">
            <div className="map-line">
              <span>Indiranagar</span>
              <strong />
              <span>RVCE</span>
            </div>
            <div className="trip-card compact">
              <span>Next best match</span>
              <strong>08:10 · 3 seats · Rs 85</strong>
              <small>College ID required · Emergency sharing on</small>
            </div>
          </div>
        </section>
      </header>

      <section className="stats-grid">
        <Stat label="Active rides" value={stats?.activeRides ?? "--"} />
        <Stat label="Seats open" value={stats?.seatsAvailable ?? "--"} />
        <Stat label="CO2 saved" value={`${stats?.carbonSavedKg?.toFixed(1) ?? "--"} kg`} />
        <Stat label="Verified drivers" value={stats?.verifiedDrivers ?? "--"} />
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
              <span>Trust score 92 · 14 shared rides</span>
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
            <h2>Offer a ride</h2>
            <div className="form-grid">
              <Field label="Driver name" value={rideForm.driverName} onChange={(value) => updateForm("driverName", value)} />
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
              <Field label="Fare per student" type="number" value={rideForm.price} onChange={(value) => updateForm("price", value)} />
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

      {activeTab === "safety" && (
        <section className="safety-grid">
          <Info title="College verification" text="Only students with institution email or uploaded ID can request and offer rides." />
          <Info title="Women-only matching" text="Riders can filter and post women-only trips for safer commuting windows." />
          <Info title="Live trip sharing" text="Every booking can send route, driver, vehicle, and ETA details to a trusted contact." />
          <Info title="SOS and reporting" text="Emergency contact, campus security number, and post-ride incident reporting are designed into the flow." />
          <Info title="Fare split" text="Transparent per-student fare with UPI handoff keeps payments simple for college commuters." />
          <Info title="Reputation" text="Ratings, recurring routes, and no-show reports help the marketplace self-correct." />
        </section>
      )}
    </main>
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
      <div className="chips">
        {ride.tags.map((tag) => <span key={tag}>{tag}</span>)}
      </div>
      <div className="ride-bottom">
        <span>{ride.seats} seats left · {ride.vehicle}</span>
        <button onClick={onBook} disabled={ride.seats === 0}>{ride.seats === 0 ? "Full" : "Request seat"}</button>
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
