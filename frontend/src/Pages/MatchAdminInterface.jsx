import { useState, useEffect } from "react";
import { Plus, Calendar, MapPin, Users, Trophy, Menu } from "lucide-react";
import "../Styles/MatchAdminInterface.css";


export default function MatchAdminInterface() {
  const [matches, setMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    sportType: "",
    matchName: "",
    homeTeam: "",
    awayTeam: "",
    startTime: "",
    venue: "",
  });
  const [_message,setMessage] = useState(null);
  const sportTypes = [
    "Football",
    "Basketball",
    "Tennis",
    "Cricket",
    "Baseball",
    "Hockey",
    "Rugby",
    "Volleyball",
    "Badminton",
    "Table Tennis",
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async() => {
    if (  !formData.sportType || !formData.matchName || !formData.homeTeam || !formData.awayTeam || !formData.startTime || !formData.venue) {
      alert("Please fill in all fields");
      return;
    }

    const newMatch = { id: Date.now(), ...formData, createdAt: new Date().toISOString() };
    setMatches((prev) => [...prev, newMatch]);
    console.log(formData);
    setFormData({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" });

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/createMatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to create match");
      }
      
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setShowForm(false);
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('https://prime-backend.azurewebsites.net/api/users/viewMatches');
        const data = await response.json();
        console.log(data);
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
        // Fallback to dummy data for development
        setMatches([
          {
            id: 1,
            homeTeam: "Manchester United",
            awayTeam: "Liverpool",
            venue: "Old Trafford",
            startTime: "2025-08-20 15:00",
            sportType: "Football",
            status: "Scheduled"
          },
          {
            id: 2,
            homeTeam: "Lakers",
            awayTeam: "Warriors",
            venue: "Crypto.com Arena",
            startTime: "2025-08-21 20:30",
            sportType: "Basketball",
            status: "Scheduled"
          },
          {
            id: 3,
            homeTeam: "England",
            awayTeam: "Australia",
            venue: "Lord's Cricket Ground",
            startTime: "2025-08-22 11:00",
            sportType: "Cricket",
            status: "Confirmed"
          },
          {
            id: 4,
            homeTeam: "Real Madrid",
            awayTeam: "Barcelona",
            venue: "Santiago Bernabéu",
            startTime: "2025-08-23 21:00",
            sportType: "Football",
            status: "Scheduled"
          },
          {
            id: 5,
            homeTeam: "Celtics",
            awayTeam: "Heat",
            venue: "TD Garden",
            startTime: "2025-08-24 19:00",
            sportType: "Basketball",
            status: "Postponed"
          },
          {
            id: 6,
            homeTeam: "India",
            awayTeam: "Pakistan",
            venue: "Eden Gardens",
            startTime: "2025-08-25 14:30",
            sportType: "Cricket",
            status: "Confirmed"
          }
        ]);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="mai-root">
      {/* Header */}
      <nav className="mai-nav">
        <div className="mai-nav-container">
          <h1 className="mai-logo">PrimeScore</h1>
          <div className="mai-nav-buttons">
            <button className="mai-create-btn" onClick={() => setShowForm(!showForm)}>
              <Plus size={18} /> Create Match
            </button>
          </div>
        </div>
      </nav>

      <div className="mai-container">
        <div className="mai-page-header">
          <h2>Match Administration</h2>
          <p>Create and manage upcoming sports matches</p>
        </div>

        {showForm && (
          <div className="mai-match-form">
            <h3>
              <Trophy size={22} /> Create New Match
            </h3>
            <div className="mai-form-grid">
              <div className="mai-form-group">
                <label>Sport Type</label>
                <select name="sportType" value={formData.sportType} onChange={handleInputChange}>
                  <option value="">Select a sport</option>
                  {sportTypes.map((sport) => (
                    <option key={sport} value={sport}>{sport}</option>
                  ))}
                </select>
              </div>

              <div className="mai-form-group">
                <label>Match Name</label>
                <input type="text" name="matchName" placeholder="e.g., Premier League Final" value={formData.matchName} onChange={handleInputChange} />
              </div>

              <div className="mai-form-group">
                <label>Home Team</label>
                <input type="text" name="homeTeam" placeholder="Enter home team name" value={formData.homeTeam} onChange={handleInputChange} />
              </div>

              <div className="mai-form-group">
                <label>Away Team</label>
                <input type="text" name="awayTeam" placeholder="Enter away team name" value={formData.awayTeam} onChange={handleInputChange} />
              </div>

              <div className="mai-form-group">
                <label>Start Time</label>
                <input type="datetime-local" name="startTime" value={formData.startTime} onChange={handleInputChange} />
              </div>

              <div className="mai-form-group">
                <label>Venue</label>
                <input type="text" name="venue" placeholder="Enter venue name" value={formData.venue} onChange={handleInputChange} />
              </div>

              <div className="mai-form-actions">
                <button className="mai-create-btn" onClick={handleSubmit}>Create Match</button>
                <button className="mai-cancel-btn" onClick={() => setShowForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="mai-matches-list">
          <div className="mai-matches-header">
            <h3>
              <Calendar size={22} /> Upcoming Matches
            </h3>
          </div>
          <div className="mai-matches-body">
            {matches.length === 0 ? (
              <div className="mai-no-matches">
                <Calendar size={80} />
                {/* <p>No matches created yet</p> */}
              </div>
            ) : (
              matches.map((match) => (
                <div key={match.id} className="mai-match-card">
                  <div className="mai-match-info">
                    <span className="mai-sport-tag">{match.sportType}</span>
                    <h4>{match.matchName}</h4>
                    <div className="mai-teams">
                      <Users size={18} /> {match.homeTeam} <span>vs</span> {match.awayTeam}
                    </div>
                    <div className="mai-match-meta">
                      <Calendar size={16} /> {formatDateTime(match.startTime)}
                      <MapPin size={16} /> {match.venue}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="mai-floating-icons">
        <div className="mai-icon mai-icon-soccer">⚽</div>
        <div className="mai-icon mai-icon-basketball">🏀</div>
        <div className="mai-icon mai-icon-tennis">🎾</div>
        <div className="mai-icon mai-icon-football">🏈</div>
        <div className="mai-icon mai-icon-tabletennis">🏓</div>
        <div className="mai-icon mai-icon-volleyball">🏐</div>
      </div>
    </div>
  );
}
