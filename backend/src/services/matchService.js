import express from "express";
import { getFirestore } from "firebase-admin/firestore";
import admin from "firebase-admin";

const app = express();

// Get ongoing match details
app.get("/api/display/:matchId", async (req, res) => {
  try {
    const { matchId } = req.params;

    // Get match event document
    const matchDoc = await db.collection("match_events").doc(matchId).get();

    if (!matchDoc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    const matchData = matchDoc.data();

    // Shape response for frontend
    const displayData = {
      matchId,
      homeScore: matchData.home_score || 0,
      awayScore: matchData.away_score || 0,
      fouls: matchData.fouls || [],
      goals: matchData.goals || [],
      substitutions: matchData.substitutions || [],
      period: matchData.period,
      isRunning: matchData.isRunning,
      updatedAt: matchData.updatedAt,
    };

    res.json(displayData);
  } catch (error) {
    console.error("Error fetching display data:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

const admin = require('firebase-admin');
const db = admin.firestore();

async function getLiveMatches() {
  const snapshot = await db.collection('match_events').where('isRunning', '==', true).get();
  const matches = [];
  snapshot.forEach(doc => {
    const data = doc.data();
    matches.push({
      matchId: doc.id,
      homeTeam: data.homeTeam,
      awayTeam: data.awayTeam,
      homeScore: data.homeScore,
      awayScore: data.awayScore,
      fouls: data.fouls,
      goals: data.goals,
      cards: data.cards,
      timeElapsed: data.timeElapsed,
      isRunning: data.isRunning
    });
  });
  return matches;
}

module.exports = { getLiveMatches };

export default app;
