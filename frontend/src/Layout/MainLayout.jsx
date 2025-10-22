import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import '../Styles/Home.css';
function MainLayout() {
  const navigate = useNavigate();
  const location = useLocation();

  const role = location.state?.role || localStorage.getItem("role") || "viewer";

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  useEffect(() => {
    setIsManager(role === "manager");
    setIsAdmin(role === "admin");
    setIsViewer(role === "viewer");
  }, [role]);

  // Resize detection
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleNavigation = (path) => {
    navigate(path, { state: { role } });
    setDropdownOpen(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownOpen && !event.target.closest(".auth-buttons")) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [dropdownOpen]);

  return (
    <div className="main-layout">
      {/* ✅ Global PrimeScore Navbar */}
      <nav className="navbar">
        <div className="nav-container">
          <div
            className="logo"
            onClick={() => handleNavigation("/home")}
            style={{ cursor: "pointer" }}
          >
            PrimeScore
          </div>

          <ul className="nav-links">
            <li>
              <a onClick={() => handleNavigation("/home")}>News</a>
            </li>

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
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavigation("/matchOdds");
                }}
              >
                Match Odds
              </a>
            </li>

            {isManager && (
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavigation("/management");
                  }}
                >
                  {isMobile ? "Team" : "Manage Team"}
                </a>
              </li>
            )}

            {isAdmin && (
              <li>
                <a
                  href="#"
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
              onClick={() => setDropdownOpen((prev) => !prev)}
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
                  onClick={() => handleNavigation("/profile")}
                >
                  Profile
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* ✅ Page content will render here */}
      <main className="page-content">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;
