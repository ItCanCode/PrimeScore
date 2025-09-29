import { X } from "lucide-react";

export default function ConfirmModal({
  show,
  onClose,
  confirmData,
  confirmAction,
  selectedMatch
}) {
  if (!show) return null;

  return (
    <div className="mai-modal-overlay">
      <div className="mai-confirm-modal">
        {/* Header */}
        <div className="mai-confirm-modal-header">
          <h3>Confirm Action</h3>
          <button onClick={onClose} className="mai-modal-close">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="mai-confirm-modal-body">
          <p>Are you sure you want to proceed with this action?</p>

          {/* Event Confirmation */}
          {confirmData?.type === "event" && (
            <div className="mai-confirm-details">
              <p><strong>Event Type:</strong> {confirmData.eventType}</p>
              <p><strong>Team:</strong> {confirmData.team}</p>
              {confirmData.player && (
                <p><strong>Player:</strong> {confirmData.player}</p>
              )}
              {confirmData.playerIn && (
                <p><strong>Player In:</strong> {confirmData.playerIn}</p>
              )}
              {confirmData.playerOut && (
                <p><strong>Player Out:</strong> {confirmData.playerOut}</p>
              )}
              <p><strong>Time:</strong> {confirmData.time}</p>
              <p>
                <strong>Match:</strong> {selectedMatch?.homeTeam} vs {selectedMatch?.awayTeam}
              </p>
            </div>
          )}

          {/* Match Confirmation */}
          {confirmData?.type === "match" && (
            <div className="mai-confirm-details">
              <p>
                <strong>Action:</strong>{" "}
                {confirmData.action === "create" ? "Create" : "Update"} Match
              </p>
              <p><strong>Sport:</strong> {confirmData.sportType}</p>
              <p>
                <strong>Match:</strong> {confirmData.homeTeam} vs {confirmData.awayTeam}
              </p>
              <p><strong>Venue:</strong> {confirmData.venue}</p>
              <p>
                <strong>Start Time:</strong>{" "}
                {new Date(confirmData.startTime).toLocaleString()}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="mai-confirm-modal-actions">
          <button className="mai-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button
            className="mai-create-btn mai-confirm-btn"
            onClick={() => {
              onClose();
              if (confirmAction) confirmAction();
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
