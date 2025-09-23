import { useState, useEffect,useContext } from "react";
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, MapPin, Users, Trophy, Menu, Clock, Play, Square, Edit2, Trash2, X } from "lucide-react";
import { AuthContext } from "../context/authContext.jsx";

import "../Styles/MatchAdminInterface.css";

export default function MatchAdminInterface() {
  const { user} = useContext(AuthContext);
  const role = user.role; 
  console.log(role);
  
  const [matches, setMatches] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);
  // Role-based booleans
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  // Set default tab to 'ongoing' so ongoing matches are shown by default
  const [activeTab, setActiveTab] = useState('ongoing');
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
    time: "",
    playerIn: "",
    playerOut: ""
  });
  const [matchEvents, setMatchEvents] = useState({});
  // Store live stats for each match (score, etc.)
  const [matchStats, setMatchStats] = useState({});
  // Confirmation modal states
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [confirmData, setConfirmData] = useState(null);
  
  // Match clock states
  const [matchClockTimes, setMatchClockTimes] = useState({});
  const [clockRunning, setClockRunning] = useState({});
  const [_clockHistory, setClockHistory] = useState({}); // Future use: audit trail
  
  // setMatchStats({});
  console.log(setMatchStats);
  


    useEffect(() => {
      setIsManager(role === 'manager');
      setIsAdmin(role === 'admin');
      setIsViewer(role === 'viewer');
    }, [role]);
  const navigate = useNavigate();
    // Handle screen size detection
    useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
        setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      };
  
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  // Load clock state from localStorage on component mount
  useEffect(() => {
    try {
      const savedClockTimes = localStorage.getItem('matchClockTimes');
      const savedClockRunning = localStorage.getItem('clockRunning');
      const savedClockHistory = localStorage.getItem('clockHistory');

      if (savedClockTimes) {
        const parsedTimes = JSON.parse(savedClockTimes);
        if (typeof parsedTimes === 'object' && parsedTimes !== null) {
          setMatchClockTimes(parsedTimes);
        }
      }

      if (savedClockRunning) {
        const parsedRunning = JSON.parse(savedClockRunning);
        if (typeof parsedRunning === 'object' && parsedRunning !== null) {
          setClockRunning(parsedRunning);
        }
      }

      if (savedClockHistory) {
        const parsedHistory = JSON.parse(savedClockHistory);
        if (typeof parsedHistory === 'object' && parsedHistory !== null) {
          setClockHistory(parsedHistory);
        }
      }
    } catch (error) {
      console.error('Error loading clock state from localStorage:', error);
      // Clear corrupted data
      localStorage.removeItem('matchClockTimes');
      localStorage.removeItem('clockRunning');
      localStorage.removeItem('clockHistory');
    }
  }, []);
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const sportTypes = [ "Football", "Basketball", "Tennis", "Cricket", "Baseball", "Hockey", "Rugby", "Volleyball", "Badminton", "Table Tennis"];

  const eventTypes = [
    "Goal", "Foul", "Yellow Card", "Red Card", "Substitution", 
    "Penalty", "Corner Kick", "Free Kick", "Offside", "Injury", "Timeout"
  ];

  const startMatch = async (match) => {
    const matchId = match.id;
    const initialDoc = {
      home_score: match.homeScore || 0,
      away_score: match.awayScore || 0,
      isRunning: true,
      period: 1,
      fouls: [],
      substitutions: [],
      goals: [],
    };

    try {
      await fetch(`https://prime-backend.azurewebsites.net/api/feed/${matchId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify(initialDoc),
      });

      updateMatchStatus(matchId, 'ongoing');
      
      // Initialize the match clock when starting
      initializeMatchClock(matchId);

    } catch (err) {
      console.error("Failed to start match", err);
      setMessage({ type: "error", text: "Failed to start match" });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEventInputChange = (e) => {
    const { name, value } = e.target;
    setEventData((prev) => ({ ...prev, [name]: value }));
  };

  const addMatchEvent = async () => {
    // Show confirmation modal first
    setConfirmData({
      type: 'event',
      eventType: eventData.eventType,
      team: eventData.team,
      player: eventData.player,
      playerIn: eventData.playerIn,
      playerOut: eventData.playerOut,
      time: eventData.time
    });
    setConfirmAction(() => executeAddMatchEvent);
    setShowConfirmModal(true);
  };

  const executeAddMatchEvent = async () => {
    let endpoint = "";
    let payload = { team: eventData.team, time: eventData.time, eventType: eventData.eventType };

    if (eventData.eventType === "Goal" || eventData.eventType === "Foul") {
      payload.player = eventData.player;
      endpoint = `/api/feed/${selectedMatch.id}/${eventData.eventType.toLowerCase()}`;
    } 
    else if (eventData.eventType === "Substitution") {
      payload.playerIn = eventData.playerIn;
      payload.playerOut = eventData.playerOut;
      endpoint = `/api/feed/${selectedMatch.id}/substitution`;
    }
    else if (eventData.eventType === "Yellow Card") {
      payload.player = eventData.player;
      payload.card = "yellow";
      endpoint = `/api/feed/${selectedMatch.id}/foul`;
    } 
    else if (eventData.eventType === "Red Card") {
      payload.player = eventData.player;
      payload.card = "red";
      endpoint = `/api/feed/${selectedMatch.id}/foul`;
    }

    try {
      const res = await fetch(`https://prime-backend.azurewebsites.net${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-user-role": "admin" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to add event");

      setMessage({ type: "success", text: "Event added successfully" });

      const newEvent = { ...payload, id: Date.now(), timestamp: new Date().toISOString() };

      // ✅ keep events sorted by time
      setMatchEvents(prev => {
        const updatedEvents = [...(prev[selectedMatch.id] || []), newEvent];
        updatedEvents.sort((a, b) => parseInt(a.time, 10) - parseInt(b.time, 10));
        return {
          ...prev,
          [selectedMatch.id]: updatedEvents,
        };
      });
    }
    catch (err) {
      setMessage({ type: "error", text: err.message });
    } 
    finally {
      setEventData({ eventType: "", team: "", player: "", time: "", playerIn: "", playerOut: "" });
      setShowEventForm(false);
    }
  };


  const openEventForm = (match) => {
    setSelectedMatch(match);
    
    // Auto-populate time with current clock time
    const currentClockTime = matchClockTimes[match.id] || 0;
    const currentMinutes = Math.floor(currentClockTime / 60);
    
    setEventData({ 
      eventType: "", 
      team: "", 
      player: "", 
      time: currentMinutes.toString(), // Set current clock minutes
      playerIn: "", 
      playerOut: "" 
    });
    
    setShowEventForm(true);
  };

  const closeEventForm = () => {
    setSelectedMatch(null);
    setShowEventForm(false);
    setEventData({ eventType: "", team: "", player: "", time: "", playerIn: "", playerOut: "" });
  };

  const handleSubmit = async() => {
    if (!formData.sportType || !formData.matchName || !formData.homeTeam || !formData.awayTeam || !formData.startTime || !formData.venue) {
      alert("Please fill in all fields");
      return;
    }
    
    if (formData.homeTeam === formData.awayTeam) {
      alert("Home and Away team must be different!");
      return;
    }

    // Show confirmation modal first
    setConfirmData({
      type: 'match',
      action: editingMatch ? 'update' : 'create',
      sportType: formData.sportType,
      matchName: formData.matchName,
      homeTeam: formData.homeTeam,
      awayTeam: formData.awayTeam,
      startTime: formData.startTime,
      venue: formData.venue
    });
    setConfirmAction(() => executeHandleSubmit);
    setShowConfirmModal(true);
  };

  const executeHandleSubmit = async() => {
  // Removed unused matchData variable to fix ESLint error

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

      const response = await fetch('https://prime-backend.azurewebsites.net/api/users/viewMatches');
      const matchesData = await response.json();
      const matchesWithStatus = matchesData.map(match => ({
        ...match,
        status: match.status || 'scheduled',
        homeScore: match.homeScore || 0,
        awayScore: match.awayScore || 0
      }));
      setMatches(matchesWithStatus);

      setEditingMatch(null);
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

    // Clean up clock state when match is no longer ongoing
    if (newStatus !== 'ongoing') {
      setMatchClockTimes(prev => {
        const { [matchId]: _removed, ...rest } = prev;
        // Update localStorage
        if (Object.keys(rest).length > 0) {
          localStorage.setItem('matchClockTimes', JSON.stringify(rest));
        } else {
          localStorage.removeItem('matchClockTimes');
        }
        return rest;
      });
      setClockRunning(prev => {
        const { [matchId]: _removed, ...rest } = prev;
        // Update localStorage
        if (Object.keys(rest).length > 0) {
          localStorage.setItem('clockRunning', JSON.stringify(rest));
        } else {
          localStorage.removeItem('clockRunning');
        }
        return rest;
      });
      // Keep clock history for reference
    } else if (newStatus === 'ongoing' && !matchClockTimes[matchId]) {
      // Re-initialize clock when resuming a finished match
      initializeMatchClock(matchId);
    }

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

  // Clock utility functions
  const initializeMatchClock = (matchId) => {
    setMatchClockTimes(prev => ({
      ...prev,
      [matchId]: 0
    }));
    setClockRunning(prev => ({
      ...prev,
      [matchId]: true
    }));
    setClockHistory(prev => ({
      ...prev,
      [matchId]: [{
        action: 'started',
        timestamp: new Date().toISOString(),
        time: 0
      }]
    }));
  };

  const pauseMatchClock = (matchId) => {
    setClockRunning(prev => ({
      ...prev,
      [matchId]: false
    }));
    setClockHistory(prev => ({
      ...prev,
      [matchId]: [
        ...(prev[matchId] || []),
        {
          action: 'paused',
          timestamp: new Date().toISOString(),
          time: matchClockTimes[matchId] || 0
        }
      ]
    }));
  };

  const resumeMatchClock = (matchId) => {
    setClockRunning(prev => ({
      ...prev,
      [matchId]: true
    }));
    setClockHistory(prev => ({
      ...prev,
      [matchId]: [
        ...(prev[matchId] || []),
        {
          action: 'resumed',
          timestamp: new Date().toISOString(),
          time: matchClockTimes[matchId] || 0
        }
      ]
    }));
  };

  const formatClockTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  
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
    // Unified function to fetch teams, matches, and live stats
    const fetchMatchesAndStats = async () => {
      // Fetch teams
      try {
        const res = await fetch("https://prime-backend.azurewebsites.net/api/admin/allTeams");
        if (!res.ok) throw new Error("Failed to fetch teams");
        const data = await res.json();
        const mappedTeams = data.teams.map(team => ({
          id: team.id,
          name: team.teamName,
        }));
        setTeams(mappedTeams);
      } catch (error) {
        console.error(`Failed to fetch teams, ${error}`);
      }

      // Fetch matches and live stats
      try {
        const response = await fetch('https://prime-backend.azurewebsites.net/api/users/viewMatches');
        const data = await response.json();
        const matchesWithStatus = data.map(match => ({
          ...match,
          status: match.status || 'scheduled',
          homeScore: match.homeScore || 0,
          awayScore: match.awayScore || 0
        }));
        setMatches(matchesWithStatus);

        // Fetch live stats (ongoing matches with scores and events)
        const statsRes = await fetch('https://prime-backend.azurewebsites.net/api/display/display-matches');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          // Debug: log the raw statsData to inspect event structure
          console.log('Fetched display-matches:', statsData);
          // Build a map of matchId -> { homeScore, awayScore } and matchId -> events
          const statsMap = {};
          const eventsMap = {};
          statsData.forEach(match => {
            statsMap[match.id] = {
              homeScore: match.homeScore ?? 0,
              awayScore: match.awayScore ?? 0
            };
            // Enhanced: collect and label events from goals, fouls, substitutions, yellowCards, redCards arrays
            let eventsArr = [];
            if (match.events) {
              // If Firestore doc structure (object with arrays)
              if (typeof match.events === 'object' && !Array.isArray(match.events)) {
                if (Array.isArray(match.events.goals)) {
                  eventsArr = eventsArr.concat(match.events.goals.map(e => ({ ...e, _guessedType: 'Goal' })));
                }
                if (Array.isArray(match.events.fouls)) {
                  eventsArr = eventsArr.concat(match.events.fouls.map(e => ({ ...e, _guessedType: 'Foul' })));
                }
                if (Array.isArray(match.events.substitutions)) {
                  eventsArr = eventsArr.concat(match.events.substitutions.map(e => ({ ...e, _guessedType: 'Substitution' })));
                }
                if (Array.isArray(match.events.yellowCards)) {
                  eventsArr = eventsArr.concat(match.events.yellowCards.map(e => ({ ...e, _guessedType: 'Yellow Card' })));
                }
                if (Array.isArray(match.events.redCards)) {
                  eventsArr = eventsArr.concat(match.events.redCards.map(e => ({ ...e, _guessedType: 'Red Card' })));
                }
                // Add any other arrays as fallback
                Object.entries(match.events).forEach(([key, value]) => {
                  if (Array.isArray(value) && !['goals','fouls','substitutions','yellowCards','redCards'].includes(key)) {
                    eventsArr = eventsArr.concat(value.map(e => ({ ...e, _guessedType: key.charAt(0).toUpperCase() + key.slice(1) })));
                  }
                });
              } else if (Array.isArray(match.events)) {
                eventsArr = match.events.flat(Infinity).filter(e => e && typeof e === 'object' && !e._seconds && !e._nanoseconds);
              } else if (Array.isArray(match.events.events)) {
                eventsArr = match.events.events.flat(Infinity).filter(e => e && typeof e === 'object' && !e._seconds && !e._nanoseconds);
              }
            }
            eventsMap[match.id] = eventsArr;
          });
          setMatchStats(statsMap);
          setMatchEvents(eventsMap);
        }
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
            status: "scheduled", 
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
    fetchMatchesAndStats();
  }, []);

  // Auto-initialize clocks when matches become ongoing
  useEffect(() => {
    matches.forEach(match => {
      if (match.status === 'ongoing' && !(match.id in matchClockTimes)) {
        initializeMatchClock(match.id);
      }
    });
  }, [matches, matchClockTimes]);

  // Clock interval - increment time every second for running clocks
  useEffect(() => {
    const interval = setInterval(() => {
      setMatchClockTimes(prev => {
        const newTimes = { ...prev };
        Object.keys(clockRunning).forEach(matchId => {
          if (clockRunning[matchId] && newTimes[matchId] !== undefined) {
            newTimes[matchId] = newTimes[matchId] + 1;
          }
        });
        return newTimes;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [clockRunning]);

  // Update event time when clock changes (if event form is open)
  useEffect(() => {
    if (showEventForm && selectedMatch && matchClockTimes[selectedMatch.id] !== undefined) {
      const currentClockTime = matchClockTimes[selectedMatch.id] || 0;
      const currentMinutes = Math.floor(currentClockTime / 60);
      
      setEventData(prev => ({
        ...prev,
        time: currentMinutes.toString()
      }));
    }
  }, [matchClockTimes, showEventForm, selectedMatch]);

  // Persist clock times to localStorage
  useEffect(() => {
    if (Object.keys(matchClockTimes).length > 0) {
      localStorage.setItem('matchClockTimes', JSON.stringify(matchClockTimes));
    }
  }, [matchClockTimes]);

  // Persist clock running states to localStorage
  useEffect(() => {
    if (Object.keys(clockRunning).length > 0) {
      localStorage.setItem('clockRunning', JSON.stringify(clockRunning));
    }
  }, [clockRunning]);

  // Persist clock history to localStorage
  useEffect(() => {
    if (Object.keys(_clockHistory).length > 0) {
      localStorage.setItem('clockHistory', JSON.stringify(_clockHistory));
    }
  }, [_clockHistory]);

  return (
    <div className="mai-root">
   
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
        <nav className="navbar">
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
                        <li>
              <a onClick={()=>{navigate("/home",{
                state:{role : role}
              });}} >News</a>
            </li>
            {/* View Matches for all roles */}
            {(isManager || isAdmin || isViewer) && (
              <li>
                <a
                  href="#home"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/sports");
                  }}
                >
                  Sports
                </a>
              </li>
            )}

            <li>
              <a href="#contact" >Contact</a>
            </li>
            {/* Manage Team for managers */}
            {isManager && (
              <li>
                <a
                  href="#management"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/management");
                  }}
                >
                  {isMobile ? "Team" : "Manage Team"}
                </a>
              </li>
            )}

            {/* Manage Matches for admins */}
            {isAdmin && (
              <li>
                <a
                  href="#match-admin"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/match-admin");
                  }}
                >
                  {"Manage Matches"}
                </a>
              </li>
            )}
          </ul>

          <div className="auth-buttons">
                      <div className="mai-nav-buttons">
            <button className="mai-create-btn" onClick={() => setShowForm(!showForm)}>
              <Plus size={18} /> Create Match
            </button>
          </div>
            <button
              className="auth-btn login-btn"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Open menu"
            >
              {isMobile ? "☰" : "Menu"} {!isMobile && "▼"}
            </button>

            {dropdownOpen && (
              <div 
                className="dropdown-content"
                role="menu"
                aria-label="User menu"
              >
                <button 
                  className="dropdown-item" 
                  title="Notifications"
                  onClick={() => {
                    console.log("Notifications clicked");
                    setDropdownOpen(false);
                  }}
                  role="menuitem"
                >
                  🔔 Notifications
                </button>

                <button
                  className="dropdown-item"
                  title="Profile"
                  onClick={() => handleNavigation("/profile")}
                  role="menuitem"
                >
                  👤 Profile
                </button>

                <button 
                  className="dropdown-item" 
                  title="Settings"
                  onClick={() => handleNavigation("/settings")}
                  role="menuitem"
                >
                  ⚙️ Settings
                </button>

                <button 
                  className="dropdown-item" 
                  title="Logout" 
                  onClick={handleLogout}
                  role="menuitem"
                >
                  🚪 Logout
                </button>
              </div>
            )}
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

                {eventData.eventType !== "Substitution" && (
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
                )}
                
                {eventData.eventType === "Substitution" && (
                  <>
                    <div className="mai-form-group">
                      <label>Player In</label>
                      <input 
                        type="text" 
                        name="playerIn" 
                        value={eventData.playerIn} 
                        onChange={handleEventInputChange} 
                        placeholder="Enter player coming in"
                      />
                    </div>
                    <div className="mai-form-group">
                      <label>Player Out</label>
                      <input 
                        type="text" 
                        name="playerOut" 
                        value={eventData.playerOut} 
                        onChange={handleEventInputChange} 
                        placeholder="Enter player going out"
                      />
                    </div>
                  </>
                )}

                <div className="mai-form-group">
                  <label>Time (Minutes) - Auto-filled from Clock</label>
                  <input 
                    type="number" 
                    name="time" 
                     min="0"
                    max="120" 
                    step="1"
                    placeholder="Auto-filled from match clock" 
                    value={eventData.time} 
                    onChange={handleEventInputChange}
                    readOnly
                    style={{ 
                      backgroundColor: 'rgba(34, 197, 94, 0.1)', 
                      border: '1px solid rgba(34, 197, 94, 0.3)',
                      color: '#22c55e'
                    }}
                  />
                  <small style={{ color: '#94a3b8', fontSize: '0.75rem' }}>
                    Time automatically set to current match clock: {selectedMatch && matchClockTimes[selectedMatch.id] ? formatClockTime(matchClockTimes[selectedMatch.id]) : '00:00'}
                  </small>
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

        {/* Confirmation Modal */}
        {showConfirmModal && (
          <div className="mai-modal-overlay">
            <div className="mai-confirm-modal">
              <div className="mai-confirm-modal-header">
                <h3>Confirm Action</h3>
                <button onClick={() => setShowConfirmModal(false)} className="mai-modal-close">
                  <X size={20} />
                </button>
              </div>
              
              <div className="mai-confirm-modal-body">
                <p>Are you sure you want to proceed with this action?</p>
                {confirmData && confirmData.type === 'event' && (
                  <div className="mai-confirm-details">
                    <p><strong>Event Type:</strong> {confirmData.eventType}</p>
                    <p><strong>Team:</strong> {confirmData.team}</p>
                    {confirmData.player && <p><strong>Player:</strong> {confirmData.player}</p>}
                    {confirmData.playerIn && <p><strong>Player In:</strong> {confirmData.playerIn}</p>}
                    {confirmData.playerOut && <p><strong>Player Out:</strong> {confirmData.playerOut}</p>}
                    <p><strong>Time:</strong> {confirmData.time}</p>
                    <p><strong>Match:</strong> {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}</p>
                  </div>
                )}
                {confirmData && confirmData.type === 'match' && (
                  <div className="mai-confirm-details">
                    <p><strong>Action:</strong> {confirmData.action === 'create' ? 'Create' : 'Update'} Match</p>
                    <p><strong>Sport:</strong> {confirmData.sportType}</p>
                    <p><strong>Match:</strong> {confirmData.homeTeam} vs {confirmData.awayTeam}</p>
                    <p><strong>Venue:</strong> {confirmData.venue}</p>
                    <p><strong>Start Time:</strong> {new Date(confirmData.startTime).toLocaleString()}</p>
                  </div>
                )}
              </div>
              
              <div className="mai-confirm-modal-actions">
                <button 
                  className="mai-cancel-btn" 
                  onClick={() => setShowConfirmModal(false)}
                >
                  Cancel
                </button>
                <button 
                  className="mai-create-btn mai-confirm-btn" 
                  onClick={() => {
                    setShowConfirmModal(false);
                    if (confirmAction) confirmAction();
                  }}
                >
                  Confirm
                </button>
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
                <select name="homeTeam" value={formData.homeTeam} onChange={handleInputChange}>
                  <option value="">Select Home Team</option>
                  {teams.map((team) => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
                {/* <input type="text" name="homeTeam" placeholder="Enter home team name" value={formData.homeTeam} onChange={handleInputChange} /> */}
              </div>

              <div className="mai-form-group">
                <label>away Team</label>
                <select name="awayTeam" value={formData.awayTeam} onChange={handleInputChange}>
                  <option value="">Select away Team</option>
                  {teams.filter((team) => team.name !== formData.homeTeam).map((team) => (
                    <option key={team.id} value={team.name}>{team.name}</option>
                  ))}
                </select>
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
              filteredMatches.map((match, idx) => (
                <div key={match.id || idx} className="mai-match-card">
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
                          {(matchStats[match.id]?.homeScore ?? 0)} - {(matchStats[match.id]?.awayScore ?? 0)}
                        </span>
                      ) : (
                        <span>vs</span>
                      )}
                      <span>{match.awayTeam}</span>
                    </div>

                    {/* Match Clock Display - only for ongoing matches */}
                    {match.status === 'ongoing' && matchClockTimes[match.id] !== undefined && (
                      <div className="mai-clock-container">
                        <div className="mai-clock-display">
                          <Clock size={18} />
                          <span className="mai-clock-time">
                            {formatClockTime(matchClockTimes[match.id] || 0)}
                          </span>
                        </div>
                        <div className="mai-clock-controls">
                          {clockRunning[match.id] ? (
                            <button
                              onClick={() => pauseMatchClock(match.id)}
                              className="mai-clock-btn mai-pause-btn"
                              title="Pause Clock"
                            >
                              <Square size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => resumeMatchClock(match.id)}
                              className="mai-clock-btn mai-resume-btn"
                              title="Resume Clock"
                            >
                              <Play size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    <div className="mai-match-meta">
                      <div>
                        <Calendar size={16} /> {formatDateTime(match.startTime)}
                      </div>
                      <div>
                        <MapPin size={16} /> {match.venue}
                      </div>
                    </div>

                    {/* Score is now always calculated from events. No manual update. */}

                    {/* Match Events Display - always show section, even if empty */}
                    <div className="mai-events-list">
                      <h5>Match Events:</h5>
                      {matchEvents[match.id] && matchEvents[match.id].length > 0 ? (
                        matchEvents[match.id].map((event, eidx) => {
                          // Determine event label, especially for fouls with card type
                          let eventLabel = event.eventType || event.type || event._guessedType;
                          if (!eventLabel && event.card === 'yellow') eventLabel = 'Foul (Yellow Card)';
                          else if (!eventLabel && event.card === 'red') eventLabel = 'Foul (Red Card)';
                          else if (!eventLabel && event.card) eventLabel = `Foul (${event.card.charAt(0).toUpperCase() + event.card.slice(1)} Card)`;
                          else if (!eventLabel) eventLabel = 'Unknown Event';
                          // If it's a foul and has a card, always show the card type
                          if ((eventLabel === 'Foul' || eventLabel === 'foul') && event.card) {
                            eventLabel = `Foul (${event.card.charAt(0).toUpperCase() + event.card.slice(1)} Card)`;
                          }
                          return (
                            <div key={event.id || eidx} className="mai-event-item">
                              <span className="mai-event-time">{event.time ? `${event.time}'` : ''}</span>
                              <span className="mai-event-type">{eventLabel}</span>
                              {event.player && <span className="mai-event-player">{event.player}</span>}
                              {event.team && <span className="mai-event-team">({event.team})</span>}
                            </div>
                          );
                        })
                      ) : (
                        <div className="mai-event-item mai-event-empty">No events yet.</div>
                      )}
                    </div>

                    {/* Status Management Controls */}
                    <div className="mai-status-controls">
                      {match.status === 'scheduled' && (
                        <button
                          onClick={() => startMatch(match)}
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