import { updateMatchStatusService } from "./matchService";

/**
 * Handles updating match status with optimistic UI updates.
 * 
 * @param {string|number} matchId - The ID of the match
 * @param {string} newStatus - The new status value
 * @param {function} setMatches - React state setter for matches
 * @param {function} setMessage - React state setter for messages
 */
export const handleUpdateMatchStatus = async (
  matchId,
  newStatus,
  setMatches,
  setMessage
) => {
  // Optimistic UI update
  setMatches(prev =>
    prev.map(match =>
      match.id === matchId ? { ...match, status: newStatus } : match
    )
  );

  try {
    await updateMatchStatusService(matchId, newStatus);
  } 
  catch (err) {
    setMessage({ type: "error", text: err.message });

    // Rollback UI if API call fails
    setMatches(prev =>
      prev.map(match =>
        match.id === matchId ? { ...match, status: match.status } : match
      )
    );
  }
};
