import { X, ChevronRight } from "lucide-react";

const LeagueModal = ({ isOpen, sport, leagues, onClose, onSelect }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="football-icon">⚽</span>
            Select {sport && sport.charAt(0).toUpperCase() + sport.slice(1)} League
          </h2>
          <button
            onClick={onClose}
            className="modal-close-button"
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="leagues-grid">
            {leagues.map((league) => (
              <button
                key={league.id}
                onClick={() => onSelect(league.id)}
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
  );
};

export default LeagueModal;
