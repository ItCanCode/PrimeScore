import { useState} from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import LeagueModal from "../Components/leagueModal.jsx";
import MatchTypeModal from "../Components/MatchType.jsx";
// import { AuthContext } from "../context/authContext.jsx";
import { getMatchTypeNavigation, getSports, getFootballLeagues, getLeaguesForSport } from "../services/sportService";
import "../Styles/SportsSelector.css";

const SportsSelector = () => {


  const [showFootballModal, setShowFootballModal] = useState(false);
  const [showLeaguesChoice, setShowLeaguesChoice] = useState(false);
  const [selectedLeague, setSelectedLeague] = useState(null);
  const [selectedSport, setSelectedSport] = useState(null);


  const navigate = useNavigate();

  const sports = getSports();
  const _footballLeagues = getFootballLeagues(); // in case you use this later

  const handleSportClick = (sportId) => {
    setSelectedSport(sportId);
    setShowFootballModal(true);
  };

  const handleLeagueSelection = (leagueId) => {
    setSelectedLeague(leagueId);
    if (leagueId === "super-rugby") {
      navigate(`/rugby/${leagueId}`);
    } else {
      setShowFootballModal(false);
      setShowLeaguesChoice(true);
    }
  };

  const handleMatchTypeSelection = (matchType) => {
    setShowLeaguesChoice(false);
    const { path, state } = getMatchTypeNavigation(selectedLeague, matchType, selectedSport);
    navigate(path, { state });
  };

  const closeModal = () => setShowFootballModal(false);
  const closeLeaguesChoice = () => {
    setShowLeaguesChoice(false);
    setSelectedLeague(null);
  };

  // 🔹 Render Sports Selection Page
  return (
    <div className="home-bg">
      <div className="container-wrapper">
        <div className="home-header">
          <h1 className="home-title">Choose Your Sport</h1>
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

      {/* League modal */}
      {showFootballModal && (
        <LeagueModal
          isOpen={showFootballModal}
          sport={selectedSport}
          leagues={getLeaguesForSport(selectedSport)}
          onClose={closeModal}
          onSelect={handleLeagueSelection}
        />
      )}

      {/* Match type modal */}
      {showLeaguesChoice && selectedLeague !== "super-rugby" && (
        <MatchTypeModal
          isOpen={showLeaguesChoice}
          onClose={closeLeaguesChoice}
          onSelect={handleMatchTypeSelection}
        />
      )}
    </div>
  );
};

export default SportsSelector;
