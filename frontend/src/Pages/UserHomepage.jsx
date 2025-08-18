import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Add this import
import "../Styles/UserHomepage.css";

function UserHomepage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate(); // Add this line

  // Logout handler
  const handleLogout = () => {
    // Clear auth tokens or user info
    localStorage.removeItem("authToken");
    // Redirect to login page
    navigate("/");
  };

  return (
    <main className="home-container">
      {/* Dropdown Menu at top right */}
      <div className="dropdown-global">
        <button
          className="menu-btn"
          onClick={() => setDropdownOpen((open) => !open)}
          aria-haspopup="true"
          aria-expanded={dropdownOpen}
        >
          Menu &#x25BC;
        </button>
        {dropdownOpen && (
          <div className="dropdown-content">
            <button className="icon-btn" title="Notifications">Notifications</button>
            <button
              className="icon-btn"
              title="Profile"
              onClick={() => navigate("/profile")}
            >
              Profile
            </button>
            <button className="icon-btn" title="Logout" onClick={handleLogout}>Logout</button>
          </div>
        )}
      </div>

      {/* Header */}
      <header className="home-header">
        <h2 className="welcome-text">Welcome Back</h2>
      </header>

      {/* Matches Section */}
      <section className="matches-section">
        <h3>Live Matches</h3>
        <p>No matches available right now.</p>
      </section>
    </main>
  );
}

export default UserHomepage;
