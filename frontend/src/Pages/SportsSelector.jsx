import { useState ,useEffect,useContext} from 'react';
import { useNavigate,Link  } from 'react-router-dom';
import { ChevronRight, Home, Trophy, Users, Calendar, X } from 'lucide-react';
import LeagueModal from '../Components/leagueModal.jsx';
import MatchTypeModal from '../Components/MatchType.jsx';
import { AuthContext } from "../context/authContext.jsx";
import { getMatchTypeNavigation } from "../services/sportService";
import '../Styles/SportsSelector.css';
import { getSports, getFootballLeagues,getLeaguesForSport } from "../services/sportService";

const SportsSelector = () => {
  const { user} = useContext(AuthContext);
  const role = user.role; 


  const [showFootballModal, setShowFootballModal] = useState(false);
  const [showLeaguesChoice, setShowLeaguesChoice] = useState(false);

  const [selectedLeague, setSelectedLeague] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);

  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isViewer, setIsViewer] = useState(false);

  const [selectedSport, setSelectedSport] = useState(null);

  const navigate = useNavigate();
  useEffect(() => {
      setIsManager(role === 'manager');
      setIsAdmin(role === 'admin');
      setIsViewer(role === 'viewer');
    }, [role]);


const sports = getSports();
const _footballLeagues = getFootballLeagues();

  useEffect(() => {
      const handleResize = () => {
        setIsMobile(window.innerWidth <= 768);
        setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
      };
  
      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }, []);

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/");
    setDropdownOpen(false);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDropdownOpen(false);
  };

  const handleSportClick = (sportId) => {
    setSelectedSport(sportId);
    setShowFootballModal(true); 
  };

  const handleLeagueSelection = (leagueId) => {
    setShowFootballModal(false);

    setSelectedLeague(leagueId);
    setShowLeaguesChoice(true);
  };

    const handleMatchTypeSelection = (matchType) => {
      setShowLeaguesChoice(false);

      const { path, state } = getMatchTypeNavigation(selectedLeague, matchType, selectedSport);
      navigate(path, { state });
    };

  const closeModal = () => {
    setShowFootballModal(false);
  };

  const closeLeaguesChoice = () => {
    setShowLeaguesChoice(false);
    setSelectedLeague(null);
  };

  const renderHomePage = () => (
    <div className="home-bg">
   
        <nav className="navbar">
        <div className="nav-container">
          <div className="logo">PrimeScore</div>

          <ul className="nav-links">
            <li>
              <a onClick={()=>{navigate("/home",{
                state:{role : role}
              });}} >News</a>
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
              <a href="#contact" >Contact</a>
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
                  title="Notifications"
                  onClick={() => {
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

      <div className="container-wrapper">
        <div className="home-header">
          <h1 className="home-title">Choose Your Sport</h1>
          <p className="home-subtitle">
         
          </p>
        </div>

        <div className="sports-grid">
          {sports.map((sport) => (
            <div
              key={sport.id}
              onClick={() => handleSportClick(sport.id)}
              className="sport-card"
            >
              <div className="card-content">
                <div className="card-header">
                  <div className="sport-icon">{sport.icon}</div>
                  <ChevronRight className="arrow-icon" />
                </div>
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-description">{sport.description}</p>
              </div>
              <div className="card-progress-wrapper">
                <div className="card-progress-bg">
                  <div className="card-progress-bar"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

     
      {showFootballModal && (
        <LeagueModal
          isOpen={showFootballModal}
          sport={selectedSport}
          leagues={getLeaguesForSport(selectedSport)}
          onClose={closeModal}
          onSelect={handleLeagueSelection}
        />
      )}
    </div>
  );

  // Render the Match Type selection for all leagues
if (showLeaguesChoice) {
  return (
    <MatchTypeModal 
      isOpen={showLeaguesChoice} 
      onClose={closeLeaguesChoice} 
      onSelect={handleMatchTypeSelection}
    />
  );
}
  return renderHomePage();
};

export default SportsSelector;