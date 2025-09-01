import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home, Trophy, Users, Calendar } from 'lucide-react';
import '../Styles/SportsSelector.css';

const SportsSelector = () => {
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

  const navigate = useNavigate();

  const handleSportClick = (sportId) => {
    if (sportId === 'football') {
      navigate("/user");
    }
    // Add navigation for other sports as needed
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
    </div>
  );

  return renderHomePage();
};

export default SportsSelector;