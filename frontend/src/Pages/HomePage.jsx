import React, { useState, useEffect } from 'react';
import '../Styles/Home.css';
import Loading from '../Components/Loading.jsx';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';

function HomePage() {
  const [user, _setUser] = useState(null);
  const [_error, _setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [matches, setMatches] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest('.auth-buttons')) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [dropdownOpen]);

  useEffect(() => {
    fetch('/api/matches/live')
      .then(res => res.json())
      .then(data => setMatches(data));

    const socket = io('http://localhost:YOUR_PORT'); // Replace with your backend port
    socket.on('matchUpdate', (data) => setMatches(data));
    return () => socket.disconnect();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return (
      <div className="user-profile">
        <h2>Welcome, {user.displayName}!</h2>
        <p>Email: {user.email}</p>
        <img src={user.photoURL} alt="profile" />
      </div>
    );
  }

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">PrimeScore</div>
          <ul className="nav-links">
            <li>
              <a href="#home" onClick={() => navigate("/sports")}>
                Matches
              </a>
            </li>
            <li>
              <a href="#management" onClick={() => navigate("/management")}>
                Manage Team
              </a>
            </li>
            <li>
              <a href="#management" onClick={() => navigate("/match-admin")}>
                Manage Matches
              </a>
            </li>
            <li>
              <a href="#admin" onClick={() => navigate("/err")}>
                Live
              </a>
            </li>
          </ul>
          <div className="auth-buttons">
            <button
              className="auth-btn login-btn"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-expanded={dropdownOpen}
            >
              Menu &#x25BC;
            </button>

            {dropdownOpen && (
              <div className="dropdown-content">
                <button 
                  className="dropdown-item" 
                  title="Notifications"
                  onClick={() => {}}
                >
                   Notifications
                </button>

                <button
                  className="dropdown-item"
                  title="Profile"
                  onClick={() => navigate("/profile")}
                >
                   Profile
                </button>

                <button 
                  className="dropdown-item" 
                  title="Logout" 
                  onClick={handleLogout}
                >
                   Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="hero" id="home">
        {/* Floating Sports Icons */}
        <div className="floating-icon icon-1">⚽</div>
        <div className="floating-icon icon-2">🏀</div>
        <div className="floating-icon icon-3">🏈</div>
        <div className="floating-icon icon-4">🎾</div>
        <div className="floating-icon icon-5">🏸</div>
        <div className="floating-icon icon-6">🏓</div>
      </section>

      <div>
        {matches.map(match => (
          <div key={match.matchId} className="match-card">
            <h3>{match.homeTeam} vs {match.awayTeam}</h3>
            <p>Score: {match.homeScore} - {match.awayScore}</p>
            <p>Time: {match.timeElapsed}</p>
            {/* Render goals, fouls, cards, etc. */}
          </div>
        ))}
      </div>
    </div>
  );
}

export default HomePage;
