import admin from "../config/firebaseAdmin.js";
const db = admin.firestore();

export const startMatch = async (req, res) => {
  const { matchId } = req.params;

  try {
    await db.collection("matchEvents").doc(matchId).set({
      homeScore: 0,
      awayScore: 0,
      isRunning: true,
      period: 1,
      events: [],
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Match started!" });
  } 
  catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to start match" });
  }
};


export const addEvent = async (req, res) => {
  const { matchId } = req.params;
  const {
    eventType,
    time,
    team,
    player,
    playerIn,
    playerOut,
    card,
    points,
    extra
  } = req.body;

  if (!eventType || !team || time === undefined) {
    return res.status(400).json({ error: "eventType, team, and time are required" });
  }

  try {
    const matchRef = db.collection("matchEvents").doc(matchId);
    const matchSnap = await matchRef.get();

    if (!matchSnap.exists) {
      return res.status(404).json({ error: "Match not found" });
    }

    const rawEvent = {
      type: eventType.toLowerCase(),
      time: Number(time),
      team: team.toLowerCase(),
      player,
      playerIn,
      playerOut,
      card,
      points,
      extra,
      timestamp: new Date().toISOString(), 
    };


    const event = Object.fromEntries(
      Object.entries(rawEvent).filter(([_, v]) => v !== undefined && v !== null)
    );

   
    const updates = {
      events: admin.firestore.FieldValue.arrayUnion(event),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    if (points && !isNaN(points)) {
      const scoreKey = team.toLowerCase() === "home" ? "homeScore" : "awayScore";
      updates[scoreKey] = admin.firestore.FieldValue.increment(Number(points));
    }

    await matchRef.update(updates);

    res.json({ success: true, message: "Event recorded!", event });
  } catch (err) {
    console.error("addEvent error:", err);
    res.status(500).json({ error: "Failed to record event" });
  }
};
