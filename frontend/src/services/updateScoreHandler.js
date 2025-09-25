import { updateScoreService } from "./matchService";

/**
 * Handles updating the score with optimistic UI updates.
 *
 * @param {string|number} matchId - The ID of the match
 * @param {number} homeScore - New home team score
 * @param {number} awayScore - New away team score
 * @param {function} setMatches - React state setter for matches
 * @param {function} setMessage - React state setter for messages
 */
export const handleUpdateScore = async (
  matchId,
  homeScore,
  awayScore,
  setMatches,
  setMessage
) => {
  // Optimistic UI update
  setMatches(prev =>
    prev.map(match =>
      match.id === matchId ? { ...match, homeScore, awayScore } : match
    )
  );

  try {
    await updateScoreService(matchId, homeScore, awayScore);
  } catch (err) {
    setMessage({ type: "error", text: err.message });
  }
};
