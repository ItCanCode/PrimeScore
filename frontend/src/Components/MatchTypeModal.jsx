// Components/MatchTypeModal.jsx
import { X, ChevronRight } from "lucide-react";

const MatchTypeModal = ({ isOpen, onClose, onSelect }) => {
  if (!isOpen) return null; // don’t render if modal is closed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">
            <span className="football-icon">🌍</span>
            Select Match Type
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
            <button
              className="league-option"
              onClick={() => onSelect("upcoming")}
            >
              <span className="league-name">Upcoming Matches</span>
              <ChevronRight className="league-arrow" />
            </button>
            <button
              className="league-option"
              onClick={() => onSelect("ongoing")}
            >
              <span className="league-name">Ongoing Matches</span>
              <ChevronRight className="league-arrow" />
            </button>
            <button
              className="league-option"
              onClick={() => onSelect("past")}
            >
              <span className="league-name">Past Matches</span>
              <ChevronRight className="league-arrow" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchTypeModal;
