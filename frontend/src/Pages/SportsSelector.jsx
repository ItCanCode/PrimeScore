import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Home, X } from 'lucide-react';
import '../Styles/SportsSelector.css';

const SportsSelector = () => {
  const [showFootballModal, setShowFootballModal] = useState(false);
  const [showLeaguesChoice, setShowLeaguesChoice] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);

  const sports = [
    { id: 'football', name: 'Football', icon: '⚽', description: '' },
    { id: 'basketball', name: 'Basketball', icon: '🏀', description: '' },
    { id: 'tennis', name: 'Tennis', icon: '🎾', description: '' },
    { id: 'baseball', name: 'Baseball', icon: '⚾', description: '' },
    { id: 'hockey', name: 'Hockey', icon: '🏒', description: 'Ice-cold competition' },
    { id: 'volleyball', name: 'Volleyball', icon: '🏐', description: 'Teamwork and timing' }
  ];

  const footballLeagues = [
    { id: 'Epl', name: 'Premier League', flag: '🏴' },
    { id: 'serie_a', name: 'Serie A', flag: '🇮🇹' },
    { id: 'PSL', name: 'PSL', flag: '🇿🇦' },
    { id: 'local-leagues', name: 'Local Leagues', flag: '🌍' }
  ];

  const navigate = useNavigate();

  const handleSportClick = (sportId) => {
    if (sportId === 'football') setShowFootballModal(true);
  };

  const handleLeagueSelection = (leagueId) => {
    setShowFootballModal(false);
    setSelectedLeague(leagueId);
    setShowLeaguesChoice(true);
  };

  const handleMatchTypeSelection = (matchType) => {
    setShowLeaguesChoice(false);

    if (matchType === 'upcoming' || matchType === 'past') {
      navigate(`/live/${matchType}`, { state: { selected_league: selectedLeague } });
    } else if (matchType === 'ongoing') {
      navigate(`/ongoing`, { state: { selected_league: selectedLeague } });
    } else {
      navigate("/past", { state: { selected_league: selectedLeague } });
    }
  };

  const closeModal = () => setShowFootballModal(false);
  const closeLeaguesChoice = () => { setShowLeaguesChoice(false); setSelectedLeague(null); };

  const renderHomePage = () => (
    <div className="home-bg">
      <div className="home-nav">
        <button onClick={() => navigate("/home")} className="home-nav-button" aria-label="Navigate to home">
          <Home className="home-nav-icon" />
        </button>
      </div>

      <div className="container-wrapper">
        <div className="home-header">
          <h1 className="home-title">Choose Your Sport</h1>
        </div>

        <div className="sports-grid">
          {sports.map(sport => (
            <div key={sport.id} onClick={() => handleSportClick(sport.id)} className="sport-card">
              <div className="card-content">
                <div className="card-header">
                  <div className="sport-icon">{sport.icon}</div>
                  <ChevronRight className="arrow-icon" />
                </div>
                <h3 className="sport-name">{sport.name}</h3>
                <p className="sport-description">{sport.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Football League Modal */}
      {showFootballModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">⚽ Select Football League</h2>
              <button onClick={closeModal} className="modal-close-button"><X size={24} /></button>
            </div>
            <div className="modal-body">
              <div className="leagues-grid">
                {footballLeagues.map(league => (
                  <button key={league.id} onClick={() => handleLeagueSelection(league.id)} className="league-option">
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

  if (showLeaguesChoice) {
    return (
      <div className="modal-overlay" onClick={closeLeaguesChoice}>
        <div className="modal-content" onClick={e => e.stopPropagation()}>
          <div className="modal-header">
            <h2 className="modal-title">🌍 Select Match Type</h2>
            <button onClick={closeLeaguesChoice} className="modal-close-button"><X size={24} /></button>
          </div>
          <div className="modal-body">
            <div className="leagues-grid">
              <button className="league-option" onClick={() => handleMatchTypeSelection('upcoming')}>
                <span className="league-name">Upcoming Matches</span>
                <ChevronRight className="league-arrow" />
              </button>
              <button className="league-option" onClick={() => handleMatchTypeSelection('ongoing')}>
                <span className="league-name">Ongoing Matches</span>
                <ChevronRight className="league-arrow" />
              </button>
              <button className="league-option" onClick={() => handleMatchTypeSelection('past')}>
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
