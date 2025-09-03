// OngoingMatches.jsx
// Displays ongoing matches with live score, fouls, and substitutions.
// Fetches data from backend API and polls for updates.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, Flag, User, ArrowLeft } from 'lucide-react';
import Loading from './Loading';

// Main component
const OngoingMatches = () => {
  const navigate = useNavigate();
  // State to hold ongoing matches
  const [matches, setMatches] = useState([]);
  // State to indicate loading
  const [loading, setLoading] = useState(true);
  // State for error handling
  const [error, setError] = useState(null);

  // Function to fetch ongoing matches from backend
  const fetchOngoingMatches = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://prime-backend.azurewebsites.net/api/display/display-matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      // Only set matches that are truly ongoing (not scheduled/upcoming)
      const ongoing = Array.isArray(data) ? data.filter(m => m.status && m.status.toLowerCase() === 'ongoing') : [];
      setMatches(ongoing);
    } catch (err) {
      setError(err.message);
      // Fallback to dummy data for development
      setMatches([
        {
          id: 1,
          homeTeam: "Manchester United",
          awayTeam: "Liverpool",
          venue: "Old Trafford",
          startTime: "2025-09-03 15:30",
          sportType: "Football",
          status: "Ongoing",
          homeScore: 2,
          awayScore: 1,
          events: [
            { type: "foul", player: "Bruno Fernandes", team: "Manchester United", description: "Rough tackle", minute: 23 },
            { type: "substitution", playerOut: "Marcus Rashford", playerIn: "Anthony Martial", team: "Manchester United", minute: 65 },
            { type: "foul", player: "Jordan Henderson", team: "Liverpool", description: "Late challenge", minute: 78 }
          ]
        },
        {
          id: 2,
          homeTeam: "Lakers",
          awayTeam: "Warriors",
          venue: "Crypto.com Arena",
          startTime: "2025-09-03 20:00",
          sportType: "Basketball",
          status: "Ongoing",
          homeScore: 89,
          awayScore: 92,
          events: [
            { type: "foul", player: "LeBron James", team: "Lakers", description: "Personal foul", minute: 8 },
            { type: "substitution", playerOut: "Russell Westbrook", playerIn: "Dennis Schroder", team: "Lakers", minute: 15 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Poll for updates every 3 minutes
  useEffect(() => {
    fetchOngoingMatches();
    const interval = setInterval(fetchOngoingMatches, 180000); // 3 minutes
    return () => clearInterval(interval);
  }, []);

  // Helper to extract score, fouls, substitutions from match events
  const getMatchStats = (events = []) => {
    let homeScore = 0, awayScore = 0;
    let fouls = [];
    let substitutions = [];
    if (Array.isArray(events)) {
      events.forEach(event => {
        if (event.type === 'score') {
          if (typeof event.home === 'number') homeScore = event.home;
          if (typeof event.away === 'number') awayScore = event.away;
        }
        if (event.type === 'foul') fouls.push(event);
        if (event.type === 'substitution') substitutions.push(event);
      });
    } else if (events && typeof events === 'object') {
      if (typeof events.homeScore === 'number') homeScore = events.homeScore;
      if (typeof events.awayScore === 'number') awayScore = events.awayScore;
      if (Array.isArray(events.fouls)) fouls = events.fouls;
      if (Array.isArray(events.substitutions)) substitutions = events.substitutions;
    }
    return { homeScore, awayScore, fouls, substitutions };
  };

  // Emoji icons by sport type
  const getSportIcon = (sport) => {
    switch (sport) {
      case 'Football':
        return '⚽';
      case 'Basketball':
        return '🏀';
      case 'Cricket':
        return '🏏';
      default:
        return '🏆';
    }
  };

  // Format date and time nicely
  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return `${dateStr} at ${timeStr}`;
  };

  // Render loading state
  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <div className="loading-text">Loading ongoing matches...</div>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="live-api-container">
        <div className="no-matches">
          <div className="no-matches-icon">⚠️</div>
          <p className="no-matches-text">Error loading matches: {error}</p>
        </div>
      </div>
    );
  }

  // Render no matches state
  if (!matches.length) {
    return (
      <div className="live-api-container">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          style={{ 
            marginBottom: '1rem', 
            padding: '0.75rem 1.5rem', 
            borderRadius: '10px', 
            border: 'none', 
            background: 'rgba(255, 255, 255, 0.1)', 
            color: '#ffffff', 
            cursor: 'pointer',
            backdropFilter: 'blur(10px)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.9rem',
            fontWeight: '500'
          }}
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="no-matches">
          <div className="no-matches-icon">🏆</div>
          <p className="no-matches-text">No ongoing matches at the moment.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      {/* Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ 
          marginBottom: '1rem', 
          padding: '0.75rem 1.5rem', 
          borderRadius: '10px', 
          border: 'none', 
          background: 'rgba(255, 255, 255, 0.1)', 
          color: '#ffffff', 
          cursor: 'pointer',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.9rem',
          fontWeight: '500',
          transition: 'all 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
        onMouseOut={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      {/* Header */}
      <div className="live-api-header">
        <h1 className="live-api-title">
          🔴 Live Matches
        </h1>
        <p className="live-api-subtitle">
          Live scores, fouls, and substitutions for matches in progress
        </p>
      </div>

      {/* Matches Grid */}
      <div className="matches-grid">
        {matches.map((match) => {
          // Prefer backend-provided homeScore/awayScore, fallback to events
          let homeScore = typeof match.homeScore === 'number' ? match.homeScore : undefined;
          let awayScore = typeof match.awayScore === 'number' ? match.awayScore : undefined;
          let fouls = [];
          let substitutions = [];
          
          if (homeScore === undefined || awayScore === undefined) {
            const stats = getMatchStats(match.events);
            if (homeScore === undefined) homeScore = stats.homeScore;
            if (awayScore === undefined) awayScore = stats.awayScore;
            fouls = stats.fouls;
            substitutions = stats.substitutions;
          } else {
            // If scores are present, still try to get fouls/subs from events
            const stats = getMatchStats(match.events);
            fouls = stats.fouls;
            substitutions = stats.substitutions;
          }
          
          const formattedDateTime = formatDateTime(match.startTime);

          return (
            <div key={match.id} className="match-card">
              {/* Match Header with Teams, Score and Status */}
              <div className="match-header">
                <div className="match-teams">
                  <div className="team-name">{match.homeTeam}</div>
                  <div className="vs-text" style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <span style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#66cc99' }}>
                      {homeScore} - {awayScore}
                    </span>
                    <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>LIVE</span>
                  </div>
                  <div className="team-name">{match.awayTeam}</div>
                </div>
                <div className="match-status" style={{ 
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)', 
                  animation: 'pulse 2s infinite' 
                }}>
                  {getSportIcon(match.sportType)} LIVE
                </div>
              </div>

              {/* Match Info */}
              <div className="match-info">
                {/* Date & Time */}
                <div className="match-datetime">
                  <Calendar className="datetime-icon" />
                  <span>{formattedDateTime}</span>
                </div>

                {/* Venue */}
                <div className="match-venue">
                  <MapPin className="venue-icon" />
                  <span>{match.venue}</span>
                </div>
              </div>

              {/* Live Events Section */}
              <div className="events-section">
                <div className="events-title">
                  <Trophy size={16} />
                  Live Match Events
                </div>
                <div className="events-list">
                  
                  {/* Fouls */}
                  {fouls.length > 0 && (
                    <div className="event-item">
                      <Flag size={14} style={{ color: '#fbbf24', marginRight: '8px' }} />
                      <div>
                        <div className="event-type">Recent Fouls</div>
                        {fouls.slice(-3).map((foul, idx) => (
                          <div key={idx} className="event-player" style={{ fontSize: '0.85rem', marginLeft: '22px' }}>
                            {foul.minute && <span className="event-minute">{foul.minute}'</span>} {foul.player} ({foul.team}) - {foul.description || 'Foul'}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Substitutions */}
                  {substitutions.length > 0 && (
                    <div className="event-item">
                      <User size={14} style={{ color: '#66cc99', marginRight: '8px' }} />
                      <div>
                        <div className="event-type">Recent Substitutions</div>
                        {substitutions.slice(-3).map((sub, idx) => (
                          <div key={idx} className="event-player" style={{ fontSize: '0.85rem', marginLeft: '22px' }}>
                            {sub.minute && <span className="event-minute">{sub.minute}'</span>} {sub.playerOut} → {sub.playerIn} ({sub.team})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* No events */}
                  {fouls.length === 0 && substitutions.length === 0 && (
                    <div className="event-item">
                      <div className="event-player">No recent events to display</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Sport Type Info */}
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: 'rgba(255, 255, 255, 0.05)', 
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.9rem'
              }}>
                <span style={{ color: '#b8c6d9' }}>Sport: {match.sportType}</span>
                <span style={{ 
                  color: '#ef4444', 
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  🔴 ONGOING
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer with last updated time */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '30px', 
        padding: '20px',
        color: '#94a3b8',
        fontSize: '0.9rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderRadius: '10px'
      }}>
        Last updated: {new Date().toLocaleString()} • Updates every 3 minutes
      </div>

      {/* Add live pulse animation */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
};

export default OngoingMatches;