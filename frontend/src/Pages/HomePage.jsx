import React, { useState, useEffect } from 'react';
import '../Styles/Home.css';
import Loading from '../Components/Loading.jsx';
import News from '../Components/News.jsx';
import { useNavigate, useLocation } from 'react-router-dom';

function HomePage() {
  const location = useLocation();
  const role = location.state?.role || 'viewer'; // Default to 'viewer' if no role
  console.log('HomePage role:', role);

  const [_error, _setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);
  const navigate = useNavigate();

  // Role-based booleans
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  useEffect(() => {
    setIsManager(role === 'manager');
    setIsAdmin(role === 'admin');
    setIsViewer(role === 'viewer');
  }, [role]);

  // Handle screen size detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1500);
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
    return () => document.removeEventListener('click', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path, { state: { role } });
    setDropdownOpen(false);
  };

  if (loading) {
    // return <Loading />;
  }

  return (
    <div className="home">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
                        <li>
              <a onClick={()=>{navigate("/home",{
                state:{role : role}
              });}} >News</a>
            </li>
            {/* View Matches for all roles */}
            {(isManager || isAdmin || isViewer) && (
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleNavigation("/sports");
                  }}
                >
                  Sports
                </a>
              </li>
            )}

            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleNavigation("/primeshots");
                }}
              >
                PrimeShots
              </a>
            </li>

            <li>
                <a 
              href="#matchOdds"
                onClick={(e) => {
                e.preventDefault();
                handleNavigation("/matchOdds");
              }}
            
            >Match odds</a>
            </li>
            {/* Manage Team for managers */}
            {isManager && (
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
            )}

            {/* Manage Matches for admins */}
            {isAdmin && (
              <li>
                <a
                  href="#match-admin"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/match-admin");
                  }}
                >
                  {"Manage Matches"}
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
                  title="Profile"
                  onClick={() => handleNavigation("/profile")}
                  role="menuitem"
                >
                   Profile
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
          {/* News Section moved up in the main content area */}
          <div className="news-dashboard">
            <h2 className="news-dashboard-title">Latest Sports News</h2>
            <News />
          </div>
        </div>

        {/* Floating Sports Icons */}
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
