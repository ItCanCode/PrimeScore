import React, { useState } from "react";
import "../Styles/UserHomepage.css";

function UserHomepage() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <main className="home-container">
      {/* Header */}
      <header className="home-header">
        <h2 className="welcome-text">Welcome Back</h2>

        {/* Dropdown Menu */}
        <div className="dropdown">
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
              <button className="icon-btn" title="Profile">Profile</button>
              <button className="icon-btn" title="Logout">Logout</button>
            </div>
          )}
        </div>
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
