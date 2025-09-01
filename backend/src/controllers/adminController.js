import admin from "../config/firebaseAdmin.js";
// adminController.js

// Create Match
export const createMatch = async (req, res) => {
  try {
    const { matchName, homeTeam, awayTeam, startTime, venue, sportType } = req.body;
    await admin.firestore().collection("matches").add({
      sportType,
      matchName,
      homeTeam,
      awayTeam,
      startTime,
      status: "scheduled",
      venue,
    });
    res.status(201).json({ message: "Match created" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Match Status
export const updateMatchStatus = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { status } = req.body;
    await admin.firestore().collection('matches').doc(matchId).update({ status });
    res.status(200).json({ message: 'Match status updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Score (stub)
export const updateScore = async (req, res) => {
  try {
    // Implement score update logic here
    res.status(200).json({ message: 'Score updated (stub)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Match Event (stub)
export const addMatchEvent = async (req, res) => {
  try {
    // Implement add event logic here
    res.status(200).json({ message: 'Event added (stub)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};