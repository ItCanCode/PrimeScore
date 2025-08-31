import { useState, useEffect } from "react";
import { Plus, Calendar, MapPin, Users, Trophy, Menu, Clock, Play, Square, Edit2, Trash2, X, ArrowLeft } from "lucide-react";
import "../Styles/MatchAdminInterface.css";
// import { useNavigate } from "react-router-dom";
export default function MatchAdminInterface() {
  // const navigate = useNavigate();
  const [matches, setMatches] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('scheduled');
  const [editingMatch, setEditingMatch] = useState(null);
  const [formData, setFormData] = useState({
    sportType: "",
    matchName: "",
    homeTeam: "",
    awayTeam: "",
    startTime: "",
    venue: "",
  });
  const [message, setMessage] = useState(null);
  const [showEventForm, setShowEventForm] = useState(false);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [eventData, setEventData] = useState({
    eventType: "",
    team: "",
    player: "",
    time: ""
  });
  const [matchEvents, setMatchEvents] = useState({});

  const sportTypes = [ "Football", "Basketball", "Tennis", "Cricket", "Baseball", "Hockey", "Rugby", "Volleyball", "Badminton", "Table Tennis"];

  const eventTypes = [
    "Goal", "Foul", "Yellow Card", "Red Card", "Substitution", 
    "Penalty", "Corner Kick", "Free Kick", "Offside", "Injury", "Timeout"
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const addMatchEvent = async () => {
    if (!eventData.eventType || !eventData.team || !eventData.player || !eventData.time) {
      alert("Please fill in all event fields");
      return;
    }

    const newEvent = {
      id: Date.now(),
      ...eventData,
      matchId: selectedMatch.id,
      timestamp: new Date().toISOString()
    };

    // Add event to local state
    setMatchEvents(prev => ({
      ...prev,
      [selectedMatch.id]: [...(prev[selectedMatch.id] || []), newEvent]
    }));

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/addMatchEvent/${selectedMatch.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventData),
      });

      if (!res.ok) {
        throw new Error("Failed to add event");
      }
      
      setMessage({ type: "success", text: "Event added successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setEventData({ eventType: "", team: "", player: "", time: "" });
      setShowEventForm(false);
    }
  };

  const openEventForm = (match) => {
    setSelectedMatch(match);
    setShowEventForm(true);
  };

  const closeEventForm = () => {
    setSelectedMatch(null);
    setShowEventForm(false);
    setEventData({ eventType: "", team: "", player: "", time: "" });
  };

  const handleSubmit = async() => {
    if (!formData.sportType || !formData.matchName || !formData.homeTeam || !formData.awayTeam || !formData.startTime || !formData.venue) {
      alert("Please fill in all fields");
      return;
    }

    const matchData = {
      ...formData,
      status: 'scheduled',
      homeScore: 0,
      awayScore: 0,
      createdAt: new Date().toISOString()
    };

    if (editingMatch) {
      // Update existing match
      setMatches((prev) => prev.map(match => 
        match.id === editingMatch.id ? { ...match, ...matchData } : match
      ));
      setEditingMatch(null);
    } else {
      // Create new match
      const newMatch = { id: Date.now(), ...matchData };
      setMatches((prev) => [...prev, newMatch]);
    }

    try {
      const endpoint = editingMatch 
        ? `https://prime-backend.azurewebsites.net/api/admin/updateMatch/${editingMatch.id}`
        : `https://prime-backend.azurewebsites.net/api/admin/createMatch`;
      
      const method = editingMatch ? "PUT" : "POST";
      
      const res = await fetch(endpoint, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data?.error || data?.message || "Failed to save match");
      }
      
      setMessage({ type: "success", text: `Match ${editingMatch ? 'updated' : 'created'} successfully` });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    } finally {
      setFormData({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" });
      setShowForm(false);
    }
  };

  const updateMatchStatus = async (matchId, newStatus) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, status: newStatus } : match
    ));

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/updateMatchStatus/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update match status");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
      // Revert local state if API call fails
      setMatches(prev => prev.map(match => 
        match.id === matchId ? { ...match, status: match.status } : match
      ));
    }
  };

  const updateScore = async (matchId, homeScore, awayScore) => {
    setMatches(prev => prev.map(match => 
      match.id === matchId ? { ...match, homeScore, awayScore } : match
    ));

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/updateScore/${matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ homeScore, awayScore }),
      });

      if (!res.ok) {
        throw new Error("Failed to update score");
      }
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const deleteMatch = async (matchId) => {
    if (!confirm('Are you sure you want to delete this match?')) return;

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net/api/admin/deleteMatch/${matchId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete match");
      }

      setMatches(prev => prev.filter(match => match.id !== matchId));
      setMessage({ type: "success", text: "Match deleted successfully" });
    } catch (err) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const editMatch = (match) => {
    setEditingMatch(match);
    setFormData({
      sportType: match.sportType,
      matchName: match.matchName,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      startTime: match.startTime,
      venue: match.venue,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingMatch(null);
    setFormData({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" });
    setShowForm(false);
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleDateString() + " at " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'scheduled': return '#3b82f6';
      case 'ongoing': return '#22c55e';
      case 'finished': return '#6b7280';
      default: return '#3b82f6';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'scheduled': return <Clock size={16} />;
      case 'ongoing': return <Play size={16} />;
      case 'finished': return <Trophy size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const filteredMatches = matches.filter(match =>  
    match.status === activeTab || (!match.status && activeTab === 'scheduled')
  );

  
  const ScoreInput = ({ match }) => {
    const [homeScore, setHomeScore] = useState(match.homeScore || 0);
    const [awayScore, setAwayScore] = useState(match.awayScore || 0);

    const handleScoreUpdate = () => {
      updateScore(match.id, parseInt(homeScore) || 0, parseInt(awayScore) || 0);
    };

    return (
      <div className="mai-score-update">
        <span>Update Score:</span>
        <input
          type="number"
          value={homeScore}
          onChange={(e) => setHomeScore(e.target.value)}
          min="0"
        />
        <span>-</span>
        <input
          type="number"
          value={awayScore}
          onChange={(e) => setAwayScore(e.target.value)}
          min="0"
        />
        <button onClick={handleScoreUpdate} className="mai-score-btn">
          Update
        </button>
      </div>
    );
  };

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('https://prime-backend.azurewebsites.net/api/users/viewMatches');
        const data = await response.json();

        // Ensure all matches have a status field
        const matchesWithStatus = data.map(match => ({
          ...match,
          status: match.status || 'scheduled',
          homeScore: match.homeScore || 0,
          awayScore: match.awayScore || 0
        }));
        console.log(matchesWithStatus)
        setMatches(matchesWithStatus);
      } catch (error) {
        console.error("Error fetching matches:", error);
        // Fallback to dummy data for development
        setMatches([
          {
            id: 1,
            homeTeam: "Manchester United",
            awayTeam: "Liverpool",
            venue: "Old Trafford",
            startTime: "2025-08-20T15:00",
            sportType: "Football",
            matchName: "Premier League Match",
            status: "scheduled", // FIXED: Changed from "upcoming" to "scheduled"
            homeScore: 0,
            awayScore: 0
          },
          {
            id: 2,
            homeTeam: "Lakers",
            awayTeam: "Warriors",
            venue: "Crypto.com Arena",
            startTime: "2025-08-21T20:30",
            sportType: "Basketball",
            matchName: "NBA Regular Season",
            status: "ongoing",
            homeScore: 85,
            awayScore: 92
          },
          {
            id: 3,
            homeTeam: "England",
            awayTeam: "Australia",
            venue: "Lord's Cricket Ground",
            startTime: "2025-08-22T11:00",
            sportType: "Cricket",
            matchName: "Test Match",
            status: "finished",
            homeScore: 287,
            awayScore: 245
          }
        ]);
      }
    };

    fetchMatches();
  }, []);

  return (
    <div className="mai-root">
   
      <nav className="mai-nav">
        <div className="mai-nav-container">
          <h1 className="mai-logo">PrimeScore</h1>
          <div className="mai-nav-buttons">
            <button className="mai-create-btn" onClick={() => setShowForm(!showForm)}>
              <Plus size={18} /> Create Match
            </button>
            {/* <button className="mai-create-btn" onClick={navigate("/home")}>
              <ArrowLeft size={18} /> Back
            </button> */}
          </div>
        </div>
      </nav>

      <div className="mai-container">
        <div className="mai-page-header">
          <h2>Match Administration</h2>
          <p>Create and manage upcoming sports matches</p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mai-message mai-message-${message.type}`}>
            {message.text}
            <button onClick={() => setMessage(null)} className="mai-message-close">×</button>
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && selectedMatch && (
          <div className="mai-modal-overlay">
            <div className="mai-event-modal">
              <div className="mai-event-modal-header">
                <h3>Add Match Event</h3>
                <p>{selectedMatch.homeTeam} vs {selectedMatch.awayTeam}</p>
                <button onClick={closeEventForm} className="mai-modal-close">
                  <X size={20} />
                </button>
              </div>

              <div className="mai-event-form">
                <div className="mai-form-group">
                  <label>Event Type</label>
                  <select name="eventType" value={eventData.eventType} onChange={handleEventInputChange}>
                    <option value="">Select event type</option>
                    {eventTypes.map((event) => (
                      <option key={event} value={event}>{event}</option>
                    ))}
                  </select>
                </div>

                <div className="mai-form-group">
                  <label>Team</label>
                  <select name="team" value={eventData.team} onChange={handleEventInputChange}>
                    <option value="">Select team</option>
                    <option value="Home">Home ({selectedMatch.homeTeam})</option>
                    <option value="Away">Away ({selectedMatch.awayTeam})</option>
                  </select>
                </div>

                <div className="mai-form-group">
                  <label>Player Responsible</label>
                  <input 
                    type="text" 
                    name="player" 
                    placeholder="Enter player name" 
                    value={eventData.player} 
                    onChange={handleEventInputChange} 
                  />
                </div>

                <div className="mai-form-group">
                  <label>Time (Minutes)</label>
                  <input 
                    type="text" 
                    name="time" 
                    placeholder="e.g., 45, 90+2" 
                    value={eventData.time} 
                    onChange={handleEventInputChange} 
                  />
                </div>

                <div className="mai-event-form-actions">
                  <button className="mai-cancel-btn" onClick={closeEventForm}>
                    Cancel
                  </button>
                  <button className="mai-create-btn" onClick={addMatchEvent}>
                    Add Event
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Status Tabs */}
        <div className="mai-status-tabs">
          {['scheduled', 'ongoing', 'finished'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`mai-tab ${activeTab === tab ? 'mai-tab-active' : ''}`}
            >
              {getStatusIcon(tab)}
              <span className="capitalize">{tab} Matches</span>
            </button>
          ))}
        </div>

        {showForm && (
          <div className="mai-match-form">
            <h3>
              <Trophy size={22} /> {editingMatch ? 'Edit Match' : 'Create New Match'}
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
                <input type="text" name="matchName" placeholder="e.g., Champions League" value={formData.matchName} onChange={handleInputChange} />
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
                <button className="mai-create-btn" onClick={handleSubmit}>
                  {editingMatch ? 'Save Changes' : 'Create Match'}
                </button>
                <button className="mai-cancel-btn" onClick={cancelEdit}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        <div className="mai-matches-list">
          <div className="mai-matches-header">
            <h3>
              <Calendar size={22} /> {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Matches
            </h3>
          </div>
          <div className="mai-matches-body">
            {filteredMatches.length === 0 ? (
              <div className="mai-no-matches">
                <Calendar size={80} />
                <p>No {activeTab} matches found</p>
              </div>
            ) : (
              filteredMatches.map((match) => (
                <div key={match.id} className="mai-match-card">
                  <div className="mai-match-header">
                    <div className="mai-match-badges">
                      <span className="mai-sport-tag">{match.sportType}</span>
                      <div 
                        className="mai-status-badge"
                        style={{ backgroundColor: getStatusColor(match.status || 'scheduled') }}
                      >
                        {getStatusIcon(match.status || 'scheduled')}
                        <span className="capitalize">{match.status || 'scheduled'}</span>
                      </div>
                    </div>
                    <div className="mai-match-actions">
                      <button
                        onClick={() => editMatch(match)}
                        className="mai-action-btn mai-edit-btn"
                        title="Edit Match"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        onClick={() => deleteMatch(match.id)}
                        className="mai-action-btn mai-delete-btn"
                        title="Delete Match"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="mai-match-info">
                    <h4>{match.matchName}</h4>
                    <div className="mai-teams">
                      <Users size={18} /> 
                      <span>{match.homeTeam}</span>
                      {(match.status === 'ongoing' || match.status === 'finished') ? (
                        <span className="mai-score">
                          {match.homeScore || 0} - {match.awayScore || 0}
                        </span>
                      ) : (
                        <span>vs</span>
                      )}
                      <span>{match.awayTeam}</span>
                    </div>
                    <div className="mai-match-meta">
                      <div>
                        <Calendar size={16} /> {formatDateTime(match.startTime)}
                      </div>
                      <div>
                        <MapPin size={16} /> {match.venue}
                      </div>
                    </div>

                    {/* Score Management for Ongoing Matches */}
                    {match.status === 'ongoing' && (
                      <ScoreInput match={match} />
                    )}

                    {/* Match Events Display */}
                    {matchEvents[match.id] && matchEvents[match.id].length > 0 && (
                      <div className="mai-events-list">
                        <h5>Match Events:</h5>
                        {matchEvents[match.id].map((event) => (
                          <div key={event.id} className="mai-event-item">
                            <span className="mai-event-time">{event.time}'</span>
                            <span className="mai-event-type">{event.eventType}</span>
                            <span className="mai-event-player">{event.player}</span>
                            <span className="mai-event-team">({event.team})</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Status Management Controls */}
                    <div className="mai-status-controls">
                      {match.status === 'scheduled' && (
                        <button
                          onClick={() => updateMatchStatus(match.id, 'ongoing')}
                          className="mai-status-btn mai-start-btn"
                        >
                          <Play size={16} />
                          Start Match
                        </button>
                      )}
                      
                      {match.status === 'ongoing' && (
                        <>
                          <button
                            onClick={() => openEventForm(match)}
                            className="mai-status-btn mai-event-btn"
                          >
                            <Plus size={16} />
                            Add Event
                          </button>
                          <button
                            onClick={() => updateMatchStatus(match.id, 'scheduled')}
                            className="mai-status-btn mai-upcoming-btn"
                          >
                            <Clock size={16} />
                            Back to Scheduled
                          </button>
                          <button
                            onClick={() => updateMatchStatus(match.id, 'finished')}
                            className="mai-status-btn mai-finish-btn"
                          >
                            <Square size={16} />
                            End Match
                          </button>
                        </>
                      )}
                      
                      {match.status === 'finished' && (
                        <button
                          onClick={() => updateMatchStatus(match.id, 'ongoing')}
                          className="mai-status-btn mai-resume-btn"
                        >
                          <Play size={16} />
                          Resume Match
                        </button>
                      )}
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