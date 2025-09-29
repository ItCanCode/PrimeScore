import admin from "../config/firebaseAdmin.js";
const createMatch = async (req, res) => {
  try {
    const { matchName, homeTeam, awayTeam, startTime, venue, sportType } = req.body;
    // Add match to Firestore and get the new document reference
    const docRef = await admin.firestore().collection("matches").add({
      sportType,
      matchName,
      homeTeam,
      awayTeam,
      startTime,
      status: "scheduled",
      venue,
    });
    // Return the Firestore document ID to the frontend
    res.status(201).json({ message: "Match created", id: docRef.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update Match Status
const updateMatchStatus = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { status } = req.body;
    const db = admin.firestore();
    const matchRef = db.collection('matches').doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return res.status(404).json({ error: 'Match not found in matches collection' });
    }

    // Prepare update data
    const updateData = { status };
    
    // If status is being set to 'finished', also set end_time
    if (status && status.toLowerCase() === 'finished') {
      updateData.end_time = admin.firestore.FieldValue.serverTimestamp();
    }
    
    // Update the status (and end_time if applicable) in 'matches'
    await matchRef.update(updateData);

    res.status(200).json({ message: `Match status updated to ${status}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Update Score (stub)
const updateScore = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { homeScore, awayScore, eventType, team, player, time } = req.body;
    const db = admin.firestore();
    // Update score in both collections if exists
    const matchRef = db.collection('matches').doc(matchId);
    const ongoingRef = db.collection('ongoingMatches').doc(matchId);
    const matchDoc = await matchRef.get();
    const ongoingDoc = await ongoingRef.get();
    if (matchDoc.exists) {
      await matchRef.update({ homeScore, awayScore });
    }
    if (ongoingDoc.exists) {
      await ongoingRef.update({ homeScore, awayScore });
    }
    // If eventType is 'Goal', add to flat match_events collection
    if (eventType === 'Goal') {
      const event = {
        eventType,
        team,
        player,
        time,
        matchId,
        timestamp: new Date().toISOString()
      };
      await db.collection('matchEvents').add(event);
    }
    res.status(200).json({ message: 'Score updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Add Match Event (stub)
const addMatchEvent = async (req, res) => {
  try {
    const matchId = req.params.id;
    const { eventType, team, player, time } = req.body;
    const db = admin.firestore();
    const event = {
      eventType,
      team,
      player,
      time,
      matchId,
      timestamp: new Date().toISOString()
    };
    await db.collection('matchEvents').add(event);
    res.status(200).json({ message: 'Event added' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const allTeams = async (req, res) => {
  try {
      const { sportType } = req.query;
      let teamsRef = admin.firestore().collection("teams");
      let snapshot;

      if (sportType) {
        snapshot = await teamsRef.where("sportType", "==", sportType).get();
      } else {
        snapshot = await teamsRef.get();
      }

      if (snapshot.empty) {
        return res.status(200).json({ teams: [] });
      }

      const teams = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      return res.status(200).json({ teams });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  };

// Get players by team name
const getPlayersByTeamName = async (req, res) => {
  try {
    const { teamName } = req.params; // coming from /api/teams/:teamName/players
    const db = admin.firestore();

    // Step 1: Find the team by name
    const teamSnapshot = await db.collection("teams")
      .where("teamName", "==", teamName)
      .limit(1)
      .get();

    if (teamSnapshot.empty) {
      return res.status(404).json({ error: "Team not found" });
    }

    const teamDoc = teamSnapshot.docs[0];
    const teamId = teamDoc.id;

    // Step 2: Get players for this team
    const playersSnapshot = await db.collection("players")
      .where("teamId", "==", teamId)
      .get();

    const players = playersSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    return res.status(200).json({ teamId, players });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteMatch = async (req, res) => {
  try {
    const matchId = req.params.id;
    const db = admin.firestore();

    const matchRef = db.collection("matches").doc(matchId);
    const matchDoc = await matchRef.get();

    if (!matchDoc.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    await matchRef.delete();

    const eventsSnapshot = await db.collection("matchEvents")
      .where("matchId", "==", matchId)
      .get();
    const batch = db.batch();
    eventsSnapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ message: "Match deleted successfully", matchId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default {
  createMatch,
  updateMatchStatus,
  updateScore,
  addMatchEvent,
  allTeams,
  getPlayersByTeamName,
  deleteMatch,
};