import React from 'react';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import '../styles/UpcomingMatches.css';

const UpcomingMatches = () => {
  const matches = [
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
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Scheduled':
        return 'status-scheduled';
      case 'Confirmed':
        return 'status-confirmed';
      case 'Postponed':
        return 'status-postponed';
      default:
        return 'status-default';
    }
  };

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

  const getSportGradientClass = (sport) => {
    switch (sport) {
      case 'Football':
        return 'sport-gradient-football';
      case 'Basketball':
        return 'sport-gradient-basketball';
      case 'Cricket':
        return 'sport-gradient-cricket';
      default:
        return 'sport-gradient-default';
    }
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
    return { dateStr, timeStr };
  };

  return (
    <div className="upcoming-matches-container">
      {/* Header */}
      <div className="header-card">
        <div className="header-content">
          <h1 className="header-title">
            <Trophy className="header-icon" size={32} />
            Upcoming Matches
          </h1>
          <p className="header-subtitle">Stay updated with the latest match schedules</p>
        </div>
      </div>

      {/* Matches Grid */}
      <div className="matches-grid">
        {matches.map((match) => {
          const { dateStr, timeStr } = formatDateTime(match.startTime);
          
          return (
            <div key={match.id} className="match-card">
              {/* Sport Header */}
              <div className={`sport-header ${getSportGradientClass(match.sportType)}`}>
                <div className="sport-header-content">
                  <div className="sport-type">
                    <span className="sport-icon">{getSportIcon(match.sportType)}</span>
                    <span className="sport-name">{match.sportType}</span>
                  </div>
                  <span className="status-label-header">
                    {match.status}
                  </span>
                </div>
              </div>

              {/* Match Content */}
              <div className="match-content">
                {/* Teams */}
                <div className="teams">
                  <div className="team-name">{match.homeTeam}</div>
                  <div className="vs">VS</div>
                  <div className="team-name">{match.awayTeam}</div>
                </div>

                {/* Match Details */}
                <div className="match-details">
                  {/* Venue */}
                  <div className="detail-item venue">
                    <MapPin size={16} className="icon-gray" />
                    <span>{match.venue}</span>
                  </div>

                  {/* Date & Time */}
                  <div className="detail-item date-time-container">
                    <div className="detail-item date">
                      <Calendar size={16} className="icon-gray" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="detail-item time">
                      <Clock size={16} className="icon-gray" />
                      <span>{timeStr}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge (Alternative Display) */}
                <div className="status-badge-container">
                  <span className={`status-badge ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="footer">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default UpcomingMatches;
