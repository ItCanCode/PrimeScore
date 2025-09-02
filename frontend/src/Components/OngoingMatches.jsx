
// OngoingMatches.jsx
// Displays ongoing matches with live score, fouls, and substitutions.
// Fetches data from backend API and polls for updates.


import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Trophy, Flag, User } from 'lucide-react';
import Loading from './Loading';
import '../Styles/OngoingMatches.css';

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
      const response = await fetch('/api/display/display-matches');
      if (!response.ok) throw new Error('Failed to fetch matches');
      const data = await response.json();
      // Only set matches that are truly ongoing (not scheduled/upcoming)
      const ongoing = Array.isArray(data) ? data.filter(m => m.status && m.status.toLowerCase() === 'ongoing') : [];
      setMatches(ongoing);
    } catch (err) {
      setError(err.message);
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
    });
    const timeStr = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    return { dateStr, timeStr };
  };

  // Utility function to map match status to CSS classes
  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Postponed':
        return 'status-postponed';
      case 'Ongoing':
        return 'status-ongoing';
      default:
        return 'status-default';
    }
  };

  // Render loading, error, or matches
  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <div className="ongoing-matches-error">Error: {error}</div>;
  }

  if (!matches.length) {
    return <div className="ongoing-matches-empty">No ongoing matches at the moment.</div>;
  }

  return (
    <div className="ongoing-matches-container">
      {/* Back Button */}
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: '#0e0d0dff', cursor: 'pointer' }}>Back</button>

      {/* Header */}
      <div className="ongoing-header-card">
        <div className="ongoing-header-content">
          <h1 className="ongoing-header-title">
            <Trophy className="ongoing-header-icon" size={36} />
            Ongoing Matches
          </h1>
          <p className="ongoing-header-subtitle">
            Live scores, fouls, and substitutions for matches in progress
          </p>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="ongoing-matches-grid">
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
          const { dateStr, timeStr } = formatDateTime(match.startTime);
          return (
            <div key={match.id} className="ongoing-match-card">
              {/* Sport Header */}
              <div className="ongoing-sport-header">
                <div className="ongoing-sport-header-content">
                  <div className="ongoing-sport-type">
                    <span className="ongoing-sport-icon">{getSportIcon(match.sportType)}</span>
                    <span className="ongoing-sport-name">{match.sportType}</span>
                  </div>
                  <span className="ongoing-status-label-header">{match.status}</span>
                </div>
              </div>

              {/* Match Content */}
              <div className="ongoing-match-content">
                {/* Teams */}
                <div className="ongoing-teams">
                  <div className="ongoing-team-name">{match.homeTeam}</div>
                  <div className="ongoing-vs">VS</div>
                  <div className="ongoing-team-name">{match.awayTeam}</div>
                </div>
                <div className="ongoing-score-row">
                  <span className="ongoing-score">{homeScore} - {awayScore}</span>
                </div>

                {/* Match Details */}
                <div className="ongoing-match-details">
                  {/* Venue */}
                  <div className="ongoing-detail-item ongoing-venue">
                    <MapPin size={18} className="ongoing-icon-gray" />
                    <span>{match.venue}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="ongoing-date-time-container">
                    <div className="ongoing-detail-item ongoing-date">
                      <Calendar size={18} className="ongoing-icon-gray" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="ongoing-detail-item ongoing-time">
                      <Clock size={18} className="ongoing-icon-gray" />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div className="ongoing-status-badge-container">
                  <span className={`ongoing-status-badge ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </div>

                {/* Extra Stats: Fouls & Substitutions */}
                <div className="ongoing-extra-stats">
                  <div className="ongoing-match-fouls">
                    <strong>Fouls:</strong>
                    {fouls.length ? (
                      <ul>
                        {fouls.map((foul, idx) => (
                          <li key={idx}>{foul.player} ({foul.team}) - {foul.description || 'Foul'}</li>
                        ))}
                      </ul>
                    ) : (
                      <span> None</span>
                    )}
                  </div>
                  <div className="ongoing-match-subs">
                    <strong>Substitutions:</strong>
                    {substitutions.length ? (
                      <ul>
                        {substitutions.map((sub, idx) => (
                          <li key={idx}>{sub.playerOut} → {sub.playerIn} ({sub.team})</li>
                        ))}
                      </ul>
                    ) : (
                      <span> None</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="ongoing-footer">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default OngoingMatches;
