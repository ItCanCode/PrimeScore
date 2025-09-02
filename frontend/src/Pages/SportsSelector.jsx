import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Trophy, Users, Calendar, X } from 'lucide-react';
import '../Styles/SportsSelector.css';

const SportsSelector = () => {
  const [showFootballModal, setShowFootballModal] = useState(false);
  
  const sports = [
    { 
      id: 'football', 
      name: 'Football', 
      icon: '⚽', 
      description: ' ' 
    },
    { 
      id: 'basketball', 
      name: 'Basketball', 
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
      id: 'volleyball', 
      name: 'Volleyball', 
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

  const handleSportClick = (sportId) => {
    if (sportId === 'football') {
      setShowFootballModal(true);
    }
   
  };

const handleLeagueSelection = (leagueId) => {
  setShowFootballModal(false);
  // Navigate based on league selection
  if(leagueId === "local-leagues"){
    navigate("/user");
  }
  else if(leagueId === "PSL"){
    navigate("/past", { 
      state: { selected_league: "PSL" } 
    });
    console.log(leagueId);
  }
  else if(leagueId === "serie_a"){
    navigate("/past", { 
      state: { selected_league: "serie_a" } 
    });
  }
  else if(leagueId === "premier-league"){ // Add this case
    navigate("/past", { 
      state: { selected_league: "Epl" } // Map to "Epl" to match PasttMatch logic
    });
  }
};

  const closeModal = () => {
    setShowFootballModal(false);
  };

  const renderHomePage = () => (
    <div className="home-bg">
      <div className="home-nav">
        <button 
          onClick={() => navigate("/home")}
          className="home-nav-button"
          aria-label="Navigate to home"
        >
          <Home className="home-nav-icon" />
        </button>
      </div>
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

  return renderHomePage();
};

export default SportsSelector;