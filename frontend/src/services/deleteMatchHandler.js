import { deleteMatchService } from "./matchService";

/**
 * Handles deleting a match with confirmation and state update.
 *
 * @param {string|number} matchId - The ID of the match
 * @param {function} setMatches - React state setter for matches
 * @param {function} setMessage - React state setter for messages
 */
export const handleDeleteMatch = async (
  matchId,
  setMatches,
  setMessage
) => {
  if (!confirm("Are you sure you want to delete this match?")) return;

  try {
    await deleteMatchService(matchId);

    setMatches(prev => prev.filter(match => match.id !== matchId));
    setMessage({ type: "success", text: "Match deleted successfully" });
  } 
  catch (err) {
    setMessage({ type: "error", text: err.message });
  }
};
