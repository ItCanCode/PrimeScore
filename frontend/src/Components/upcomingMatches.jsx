import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Trophy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const UpcomingMatches = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // ✅ sportType passed from navigation state
  const sportType = location.state?.sport || null;

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await fetch('https://prime-backend.azurewebsites.net/api/users/viewMatches');
        const data = await response.json();
        setMatches(data);
      } catch (error) {
        console.error("Error fetching matches:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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

  // ✅ Filter only scheduled/confirmed AND match the sportType if provided
  const upcomingMatches = matches.filter(match => {
    const statusOk = ['scheduled', 'confirmed'].includes((match.status || '').toLowerCase());
    const sportOk = !sportType || (match.sportType?.toLowerCase() === sportType.toLowerCase());
    return statusOk && sportOk;
  });

  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <div className="loading-text">Loading upcoming matches</div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      {/* Header */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: '#0e0d0dff', cursor: 'pointer' }}
      >
        Back
      </button>
      <div className="live-api-header">
        <h1 className="live-api-title">
          <Trophy size={36} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Upcoming {sportType ? `${sportType} ` : ''}Matches
        </h1>
        <p className="live-api-subtitle">
          Stay updated with the latest match schedules
        </p>
      </div>

      {/* Matches Grid */}
      {upcomingMatches.length > 0 ? (
        <div className="matches-grid">
          {upcomingMatches.map((match) => {
            const formattedDateTime = formatDateTime(match.startTime);

            return (
              <div key={match.id} className="match-card">
                {/* Match Header */}
                <div className="match-header">
                  <div className="match-teams">
                    <div className="team-name">{match.homeTeam}</div>
                    <div className="vs-text">VS</div>
                    <div className="team-name">{match.awayTeam}</div>
                  </div>
                  <div className="match-status">
                    {getSportIcon(match.sportType)} {match.status}
                  </div>
                </div>

                {/* Match Info */}
                <div className="match-info">
                  <div className="match-datetime">
                    <Calendar className="datetime-icon" />
                    <span>{formattedDateTime}</span>
                  </div>
                  <div className="match-venue">
                    <MapPin className="venue-icon" />
                    <span>{match.venue}</span>
                  </div>
                </div>

                {/* Sport Type */}
                <div className="events-section">
                  <div className="events-title">
                    <Trophy size={16} />
                    Sport: {match.sportType}
                  </div>
                  <div className="event-item">
                    <span className="event-type">Competition Match</span>
                    <span className="event-player">
                      {match.homeTeam} hosting {match.awayTeam}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="no-matches">
          <div className="no-matches-icon">🏆</div>
          <p className="no-matches-text">
            No upcoming {sportType ? sportType.toLowerCase() : ''} matches scheduled at the moment
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingMatches;
