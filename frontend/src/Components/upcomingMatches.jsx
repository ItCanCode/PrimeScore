import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
const UpcomingMatches = () => {
    const navigate = useNavigate();
  
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  
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
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, []);

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

  // Only show matches with status 'Scheduled' or 'Confirmed'
  const upcomingMatches = matches.filter(match => 
    ['scheduled', 'confirmed'].includes((match.status || '').toLowerCase())
  );

  if (loading) {
    return (
      <div className="live-api-container">
        <div className="loading-container">
          <div className="loading-text">Loading upcoming matches...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="live-api-container">
      {/* Header */}
      <button onClick={() => navigate(-1)} style={{ marginBottom: '1rem', padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', color: '#0e0d0dff', cursor: 'pointer' }}>Back</button>
      <div className="live-api-header">
        <h1 className="live-api-title">
          <Trophy size={36} style={{ verticalAlign: 'middle', marginRight: '10px' }} />
          Upcoming Matches
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
                {/* Match Header with Teams and Status */}
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

                {/* Sport Type Section */}
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
            No upcoming matches scheduled at the moment
          </p>
        </div>
      )}
    </div>
  );
};

export default UpcomingMatches;