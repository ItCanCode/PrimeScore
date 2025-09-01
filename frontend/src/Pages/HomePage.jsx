import React, { useState, useEffect } from 'react';
import '../Styles/Home.css';
import Loading from '../Components/Loading.jsx';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [user, _setUser] = useState(null);
  const [_error, _setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Handle screen size detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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

  // Close dropdown when screen size changes to mobile
  useEffect(() => {
    if (isMobile && dropdownOpen) {
      setDropdownOpen(true);
    }
  }, [isMobile, dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  if (loading) {
    return <Loading />;
  }

  if (user) {
    return (
      <div className="home">
        <div className="user-profile">
          <h2>Welcome, {user.displayName}!</h2>
          <p>Email: {user.email}</p>
          {user.photoURL && (
            <img src={user.photoURL} alt="profile" />
          )}
        </div>
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
              <a 
                href="#home" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/sports");
                }}
              >
                {isMobile ? "Matches" : "View Matches"}
              </a>
            </li>
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
            <li>
              <a 
                href="#match-admin" 
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/match-admin");
                }}
              >
                {isMobile ? "Admin" : "Manage Matches"}
              </a>
            </li>

          </ul>
          
          <div className="auth-buttons">
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
                    // Add notifications functionality here
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

      <section className="hero" id="home">
        <div className="hero-content">
    
        </div>

        {/* Floating Sports Icons - Hide some on mobile for better performance */}
        <div className="floating-icon icon-1">⚽</div>
        <div className="floating-icon icon-2">🏀</div>
        {!isMobile && <div className="floating-icon icon-3">🏈</div>}
        <div className="floating-icon icon-4">🎾</div>
        {!isMobile && <div className="floating-icon icon-5">🏸</div>}
        <div className="floating-icon icon-6">🏓</div>
      </section>



   
    </div>
  );
}

export default HomePage;