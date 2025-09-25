import { saveMatchService, fetchMatchesService } from "./matchService";

/**
 * Handles saving/updating a match and refreshing matches list.
 * 
 * @param {object} formData - Match form values
 * @param {object|null} editingMatch - The match being edited (if any)
 * @param {function} setMessage - React state setter for messages
 * @param {function} setMatches - React state setter for matches
 * @param {function} setEditingMatch - React state setter for editing match
 * @param {function} setFormData - React state setter for form data
 * @param {function} setShowForm - React state setter for form visibility
 */

export const handleSubmitService = async ( formData, editingMatch, setMessage, setMatches, setEditingMatch, setFormData, setShowForm) => {
  try {
    await saveMatchService(formData, editingMatch);

    setMessage({ type: "success", text: `Match ${editingMatch ? "updated" : "created"} successfully` });

    const matchesWithStatus = await fetchMatchesService();
    setMatches(matchesWithStatus);

    setEditingMatch(null);
  } 
  catch (err) {
    setMessage({ type: "error", text: err.message });
  } 
  finally {
    setFormData({ sportType: "", matchName: "", homeTeam: "", awayTeam: "", startTime: "", venue: "" });
    setShowForm(false);
  }
};
