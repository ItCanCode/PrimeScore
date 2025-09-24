import { useState ,useEffect,useContext} from 'react';
import { useNavigate,Link  } from 'react-router-dom';
import { ChevronRight, Home, Trophy, Users, Calendar, X } from 'lucide-react';
import { AuthContext } from "../context/authContext.jsx";
import '../Styles/SportsSelector.css';

const SportsSelector = () => {
  const { user} = useContext(AuthContext);
  const role = user.role; 
  console.log(role);

  const [showFootballModal, setShowFootballModal] = useState(false);
  const [showLeaguesChoice, setShowLeaguesChoice] = useState(false);

  const [selectedLeague, setSelectedLeague] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [_isTablet, setIsTablet] = useState(false);
  // Role-based booleans
  const [isManager, setIsManager] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isViewer, setIsViewer] = useState(false);
  
  useEffect(() => {
      setIsManager(role === 'manager');
      setIsAdmin(role === 'admin');
      setIsViewer(role === 'viewer');
    }, [role]);

  const sports = [
    { 
      id: 'football', 
      name: 'Football', 
      icon: '⚽', 
      description: ' ' 
    },
    { 
      id: 'basketball', 
      name: 'BaskeRutball', 
      icon: '🏀', 
      description: ' ' 
    },
    { 
      id: 'tennis', 
      name: 'Tennis', 
      icon: '🎾', 
      description: ' ' 
    },
    { 
      id: 'baseball', 
      name: 'Baseball', 
      icon: '⚾', 
      description: ' ' 
    },
    { 
      id: 'hockey', 
      name: 'Hockey', 
      icon: '🏒', 
      description: 'Ice-cold competition with lightning-fast gameplay' 
    },
    { 
      id: 'rugby', 
      name: 'Rugby', 
      icon: '🏐', 
      description: 'Teamwork and timing in every spike and block' 
    }

  ];

  const footballLeagues = [
    { id: 'premier-league', name: 'Premier League', flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿' },
    { id: 'serie_a', name: 'Serie A', flag: '🇮🇹' },
    { id: 'PSL', name: 'PSL', flag: '🇿🇦' },
    { id: 'local-leagues', name: 'Local Leagues', flag: '🌍' }
  ];


  const navigate = useNavigate();

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
    if (sportId === 'football') {
      setShowFootballModal(true);
    }
      
      else if (sportId === 'rugby') { 
    navigate('/rugby'); 
  } 

  };

  

const handleLeagueSelection = (leagueId) => {
  setShowFootballModal(false);
  setSelectedLeague(leagueId);
  setShowLeaguesChoice(true);
};

const handleMatchTypeSelection = (matchType) => {
  setShowLeaguesChoice(false);
  if(selectedLeague == "local-leagues"){
    navigate(`/${matchType}`)
    console.log(matchType);
    
  }
  else if (matchType === 'upcoming' || matchType === 'past') {
    navigate(`/live/${matchType}`,{
      state:{selected_league:selectedLeague}
    });
  } else {
  
    let leagueParam = selectedLeague;
    if (selectedLeague === "premier-league") {
      leagueParam = "Epl";
    }
    
    navigate("/past", { 
      state: { selected_league: leagueParam } 
    });
  }
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
              <a onClick={()=>{              navigate("/home",{
                state:{role : role}
              });}} >News</a>
            </li>
            {/* View Matches for all roles */}
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

      {/* Football League Selection Modal */}
      {showFootballModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                <span className="football-icon">⚽</span>
                Select Football League
              </h2>
              <button 
                onClick={closeModal}
                className="modal-close-button"
                aria-label="Close modal"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="modal-body">
              <div className="leagues-grid">
                {footballLeagues.map((league) => (
                  <button
                    key={league.id}
                    onClick={() => handleLeagueSelection(league.id)}
                    className="league-option"
                  >
                    <span className="league-flag">{league.flag}</span>
                    <span className="league-name">{league.name}</span>
                    <ChevronRight className="league-arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render the Match Type selection for all leagues
  if (showLeaguesChoice) {
    return (
      <div className="modal-overlay" onClick={closeLeaguesChoice}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">
              <span className="football-icon">🌍</span>
              Select Match Type
            </h2>
            <button 
              onClick={closeLeaguesChoice}
              className="modal-close-button"
              aria-label="Close modal"
            >
              <X size={24} />
            </button>
          </div>
          <div className="modal-body">
            <div className="leagues-grid">
              <button
                className="league-option"
                onClick={() => handleMatchTypeSelection('upcoming')}
              >
                <span className="league-name">Upcoming Matches</span>
                <ChevronRight className="league-arrow" />
              </button>
              <button
                className="league-option"
                onClick={() => handleMatchTypeSelection('ongoing')}
              >
                <span className="league-name">Ongoing Matches</span>
                <ChevronRight className="league-arrow" />
              </button>
              <button
                className="league-option"
                onClick={() => handleMatchTypeSelection('past')}
              >
                <span className="league-name">Past Matches</span>
                <ChevronRight className="league-arrow" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  return renderHomePage();
};

export default SportsSelector;