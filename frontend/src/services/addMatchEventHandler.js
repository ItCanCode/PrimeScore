import { addMatchEventService } from "./matchService";

/**
 * Handles adding a match event with UI updates.
 *
 * @param {object} selectedMatch - The selected match object
 * @param {object} eventData - Event data from form
 * @param {function} setMatchEvents - React state setter for match events
 * @param {function} setMessage - React state setter for messages
 * @param {function} resetEventForm - Function to reset form & close modal
 */
export const handleAddMatchEvent = async (
  selectedMatch,
  eventData,
  setMatchEvents,
  setMessage,
  resetEventForm
) => {
  try {
    const newEvent = await addMatchEventService(selectedMatch.id, eventData);

    setMessage({ type: "success", text: "Event added successfully" });

    // Keep events sorted by time
    setMatchEvents(prev => {
      const updatedEvents = [...(prev[selectedMatch.id] || []), newEvent];
      updatedEvents.sort((a, b) => parseInt(a.time, 10) - parseInt(b.time, 10));
      return { ...prev, [selectedMatch.id]: updatedEvents };
    });
  } 
  catch (err) {
    setMessage({ type: "error", text: err.message });
  } 
  finally {
    resetEventForm();
  }
};
