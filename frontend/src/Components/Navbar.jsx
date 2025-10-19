import React,{useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function Navbar({
  role,
  isMobile,
  showForm,
  setShowForm
}) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  const handleNavigation = (path) => { 
    navigate(path); 
    setDropdownOpen(false);
  };
  
  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };
  // Role-based booleans
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
    useEffect(() => {
      setIsManager(role === 'manager');
      setIsAdmin(role === 'admin');
      setIsViewer(role === 'viewer');
    }, [role]);
  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="logo">PrimeScore</div>

        <ul className="nav-links">
          <li>
            <a
              onClick={() => {
                navigate("/home", { state: { role } });
              }}
            >
              News
            </a>
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
            <a 
            href="#matchOdds"
                onClick={(e) => {
                e.preventDefault();
                handleNavigation("/primeshots");
              }}
            
            >Match odds</a>
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
                {isMobile ? "Team" : "Manage Team"}
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
          {(isAdmin || isManager) && (
            <div className="mai-nav-buttons">
              <button
                className="mai-create-btn"
                onClick={() => setShowForm(!showForm)}
              >
                <Plus size={18} /> Create Match
              </button>
            </div>
          )}

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
            <div className="dropdown-content" role="menu" aria-label="User menu">
              <button
                className="dropdown-item"
                title="Notifications"
                onClick={() => setDropdownOpen(false)}
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
  );
}
