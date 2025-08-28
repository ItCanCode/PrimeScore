
import { ChevronRight, Home, Trophy, Users, Calendar } from 'lucide-react';
import '../Styles/SportsSelector.css'; // import the CSS file

const SportsSelector = () => {


  const sports = [
    { id: 'football', name: 'Football', icon: '⚽', description: 'The beautiful game played worldwide' },
    { id: 'basketball', name: 'Basketball', icon: '🏀', description: 'Fast-paced court action' },

  ];

  const renderHomePage = () => (
    <div className="home-bg">
      <div className="container-wrapper">
        <div className="home-header">
          <h1 className="home-title">Pick a sport</h1>
        </div>

        <div className="sports-grid">
          {sports.map((sport) => (
            <div
              key={sport.id}
              onClick={() => {}}
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
