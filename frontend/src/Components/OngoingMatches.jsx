import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, Trophy } from 'lucide-react';
import '../Styles/upcomingMatches.css';
import { db } from '../firebase';
import { collection, getDocs } from 'firebase/firestore';

const OngoingMatches = () => {
  const [matches, setMatches] = useState([]);

  useEffect(() => {
    const fetchOngoingMatches = async () => {
      try {
        // Fetch ongoing matches from Firestore
        const querySnapshot = await getDocs(collection(db, 'ongoingMatches'));
        const ongoing = [];
        querySnapshot.forEach((doc) => {
          ongoing.push({ id: doc.id, ...doc.data() });
        });
        setMatches(ongoing);
      } catch (error) {
        console.error('Error fetching ongoing matches:', error);
        setMatches([]);
      }
    };
    fetchOngoingMatches();
  }, []);

  const getStatusColor = (status) => {
    if (status === 'ongoing') return 'status-confirmed';
    return 'status-default';
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

  return (
    <div className="upcoming-matches-container">
      <div className="header-card">
        <div className="header-content">
          <h1 className="header-title">
            <Trophy className="header-icon" size={36} />
            Ongoing Matches
          </h1>
          <p className="header-subtitle">
            View all matches currently in progress
          </p>
        </div>
      </div>
      <div className="matches-grid">
        {matches.length === 0 ? (
          <div className="no-matches">No ongoing matches found.</div>
        ) : (
          matches.map((match) => {
            const { dateStr, timeStr } = formatDateTime(match.startTime);
            return (
              <div key={match.id} className="match-card">
                <div className="sport-header">
                  <div className="sport-header-content">
                    <div className="sport-type">
                      <span className="sport-icon">{getSportIcon(match.sportType)}</span>
                      <span className="sport-name">{match.sportType}</span>
                    </div>
                    <span className="status-label-header">{match.status}</span>
                  </div>
                </div>
                <div className="match-content">
                  <div className="teams">
                    <div className="team-name">{match.homeTeam}</div>
                    <div className="vs">VS</div>
                    <div className="team-name">{match.awayTeam}</div>
                  </div>
                  <div className="match-details">
                    <div className="detail-item venue">
                      <MapPin size={18} className="icon-gray" />
                      <span>{match.venue}</span>
                    </div>
                    <div className="date-time-container">
                      <div className="detail-item date">
                        <Calendar size={18} className="icon-gray" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="detail-item time">
                        <Clock size={18} className="icon-gray" />
                        <span>{timeStr}</span>
                      </div>
                    </div>
                  </div>
                  <div className="status-badge-container">
                    <span className={`status-badge ${getStatusColor(match.status)}`}>
                      {match.status}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
      <div className="footer">
        Last updated: {new Date().toLocaleString()}
      </div>
    </div>
  );
};

export default OngoingMatches;
