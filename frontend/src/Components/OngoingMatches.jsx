
// OngoingMatches.jsx
// Displays ongoing matches with live score, fouls, and substitutions.
// Fetches data from backend API and polls for updates.

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Flag, User, RefreshCw } from 'lucide-react';
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
  // The backend returns an array, not an object with a 'matches' property
  setMatches(Array.isArray(data) ? data : []);
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
    // Default values
    let homeScore = 0, awayScore = 0;
    let fouls = [];
    let substitutions = [];

    if (Array.isArray(events)) {
      // If events is an array, process as before
      events.forEach(event => {
        if (event.type === 'score') {
          if (typeof event.home === 'number') homeScore = event.home;
          if (typeof event.away === 'number') awayScore = event.away;
        }
        if (event.type === 'foul') {
          fouls.push(event);
        }
        if (event.type === 'substitution') {
          substitutions.push(event);
        }
      });
    } else if (events && typeof events === 'object') {
      // If events is an object, extract score, fouls, substitutions if present
      if (typeof events.homeScore === 'number') homeScore = events.homeScore;
      if (typeof events.awayScore === 'number') awayScore = events.awayScore;
      if (Array.isArray(events.fouls)) fouls = events.fouls;
      if (Array.isArray(events.substitutions)) substitutions = events.substitutions;
    }
    return { homeScore, awayScore, fouls, substitutions };
  };

  // Render loading, error, or matches
  if (loading) {
    return (
      <div className="ongoing-matches-loading">
        <RefreshCw className="spin" /> Loading ongoing matches...
      </div>
    );
  }

  if (error) {
    return <div className="ongoing-matches-error">Error: {error}</div>;
  }

  if (!matches.length) {
    return <div className="ongoing-matches-empty">No ongoing matches at the moment.</div>;
  }

  return (
    <div className="ongoing-matches-container">
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: '#0e0d0dff', cursor: 'pointer' }}>Back</button>
      <h2>Ongoing Matches</h2>
      {matches.map(match => {
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
        return (
          <div key={match.id} className="ongoing-match-card">
            <h3>{match.homeTeam} vs {match.awayTeam}</h3>
            <div className="match-score">
              <span className="score-home">{homeScore}</span>
              <span> - </span>
              <span className="score-away">{awayScore}</span>
            </div>
            <div className="match-details">
              <div className="match-fouls">
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
              <div className="match-subs">
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
        );
      })}
    </div>
  );
};

export default OngoingMatches;
