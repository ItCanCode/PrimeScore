import React, { useEffect, useState } from "react";
import axios from "axios";
import "../Styles/PrimeShots.css";
import "../Styles/Home.css"; // For navbar styles
import { useLocation, useNavigate } from "react-router-dom";

const YouTubeShorts = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSport, setSelectedSport] = useState("football");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // Get role from location state or default to viewer
  const userRole = location.state?.role || "viewer";

  // Role-based booleans
  const isManager = userRole === 'manager';
  const isAdmin = userRole === 'admin';
  const isViewer = userRole === 'viewer';

  const handleNavigation = (path) => {
    console.log('YouTubeShorts navigating to:', path, 'with role:', userRole);
    setDropdownOpen(false);
    
    // Force immediate navigation
    try {
      navigate(path, { 
        state: { role: userRole },
        replace: false 
      });
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback navigation without state
      navigate(path);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };
  
  // Use the variables to avoid eslint errors
  console.log("PrimeShots loaded for role:", userRole);

  const VideoFrame = ({ video, index }) => {
    const [hasError, setHasError] = useState(false);
    
    return (
      <div key={index} className="video-card">
        {!hasError ? (
          <iframe
            className="video-iframe"
            src={`https://www.youtube-nocookie.com/embed/${video.videoId}?modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&disablekb=0&fs=1&cc_load_policy=0&origin=${encodeURIComponent(window.location.origin)}&enablejsapi=0`}
            title={`${video.title} - Sports highlight video`}
            allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            sandbox="allow-scripts allow-same-origin allow-presentation"
            loading="lazy"
            onError={() => setHasError(true)}
            aria-label={`Video: ${video.title} by ${video.channel}`}
          />
        ) : (
          <div className="video-error-placeholder">
            <div className="error-icon">⚠️</div>
            <p>Video unavailable</p>
            <a 
              href={`https://youtube.com/watch?v=${video.videoId}`} 
              target="_blank" 
              rel="noopener noreferrer"
              className="watch-on-youtube-btn"
            >
              Watch on YouTube
            </a>
          </div>
        )}
        <div className="video-info">
          <h3 className="video-title">{video.title}</h3>
          <p className="video-channel">By {video.channel}</p>
        </div>
      </div>
    );
  };

  useEffect(() => {
    const fetchShorts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`/api/youtube/shorts?sport=${selectedSport}`);
        setVideos(res.data.videos || []);
      } catch (error) {
        console.error("Error fetching YouTube shorts:", error);
        setError(error.response?.data?.message || "Failed to load PrimeShots. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchShorts();
  }, [selectedSport]);

  // Suppress known YouTube ad-related CORS errors
  useEffect(() => {
    const originalError = console.error;
    console.error = (...args) => {
      const message = args[0];
      if (
        typeof message === 'string' && 
        (
          message.includes('googleads.g.doubleclick.net') ||
          message.includes('CORS policy') ||
          message.includes('aria-hidden on an element because its descendant retained focus')
        )
      ) {
        // Suppress these specific YouTube embed errors
        return;
      }
      originalError.apply(console, args);
    };

    return () => {
      console.error = originalError;
    };
  }, []);

  if (loading) return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
            <li>
              <a onClick={() => {
                navigate("/home", {
                  state: { role: userRole }
                });
              }}>News</a>
            </li>
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
              <a
                href="#primeshots"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/primeshots");
                }}
              >
                PrimeShots
              </a>
            </li>

            <li>
              <a>Contact</a>
            </li>
            {isManager && (
              <li>
                <a
                  href="#management"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/management");
                  }}
                >
                  Manage Team
                </a>
              </li>
            )}

            {isAdmin && (
              <li>
                <a
                  href="#match-admin"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/match-admin");
                  }}
                >
                  Manage Matches
                </a>
              </li>
            )}
          </ul>

          <div className="auth-buttons">
            <button
              className="auth-btn login-btn"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Open menu"
            >
              Menu ▼
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
                   Notifications
                </button>

                <button
                  className="dropdown-item"
                  title="Profile"
                  onClick={() => handleNavigation("/profile")}
                  role="menuitem"
                >
                   Profile
                </button>

                <button 
                  className="dropdown-item" 
                  title="Settings"
                  onClick={() => handleNavigation("/settings")}
                  role="menuitem"
                >
                   Settings
                </button>

                <button 
                  className="dropdown-item" 
                  title="Logout" 
                  onClick={handleLogout}
                  role="menuitem"
                >
                   Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="primeshots-loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading PrimeShots...</p>
      </div>
    </div>
  );

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
            <li>
              <a onClick={() => {
                navigate("/home", {
                  state: { role: userRole }
                });
              }}>News</a>
            </li>
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
              <a
                href="#primeshots"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/primeshots");
                }}
              >
                PrimeShots
              </a>
            </li>

            <li>
              <a>Contact</a>
            </li>
            {isManager && (
              <li>
                <a
                  href="#management"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/management");
                  }}
                >
                  Manage Team
                </a>
              </li>
            )}

            {isAdmin && (
              <li>
                <a
                  href="#match-admin"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/match-admin");
                  }}
                >
                  Manage Matches
                </a>
              </li>
            )}
          </ul>

          <div className="auth-buttons">
            <button
              className="auth-btn login-btn"
              onClick={() => setDropdownOpen(prev => !prev)}
              aria-expanded={dropdownOpen}
              aria-haspopup="true"
              aria-label="Open menu"
            >
              Menu ▼
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
                   Notifications
                </button>

                <button
                  className="dropdown-item"
                  title="Profile"
                  onClick={() => handleNavigation("/profile")}
                  role="menuitem"
                >
                   Profile
                </button>

                <button 
                  className="dropdown-item" 
                  title="Settings"
                  onClick={() => handleNavigation("/settings")}
                  role="menuitem"
                >
                   Settings
                </button>

                <button 
                  className="dropdown-item" 
                  title="Logout" 
                  onClick={handleLogout}
                  role="menuitem"
                >
                   Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
      <div className="primeshots-wrapper">
        <div className="primeshots-header">
          <h1 className="primeshots-title">PrimeShots</h1>
          <p className="primeshots-subtitle">Your ultimate sports highlights destination</p>
        </div>

        <div className="sport-selector-container">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
            className="sport-selector"
          >
            <option value="football">Football</option>
            <option value="basketball">Basketball</option>
            <option value="tennis">Tennis</option>
            <option value="cricket">Cricket</option>
            <option value="rugby">Rugby</option>
            <option value="volleyball">Volleyball</option>
          </select>
        </div>

        {error ? (
          <div className="primeshots-error">
            <p className="error-icon">⚠️ Oops!</p>
            <p className="error-message">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="error-retry-btn"
            >
              Try Again
            </button>
          </div>
        ) : videos.length === 0 ? (
          <div className="primeshots-empty">
            <p className="empty-message">No shorts available for this sport.</p>
            <p className="empty-suggestion">Try selecting a different sport from the dropdown above.</p>
          </div>
        ) : (
          <div className="videos-grid">
            {videos.map((video, index) => (
              <VideoFrame key={video.videoId || index} video={video} index={index} />
            ))}
          </div>
        )}
      </div>
        </div>
      </section>
    </div>
  );
};

export default YouTubeShorts;
