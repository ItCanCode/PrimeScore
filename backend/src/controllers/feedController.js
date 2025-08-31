import admin from "../config/firebaseAdmin.js";

const db = admin.firestore();

export const startMatch = async (req, res) => {
    const { matchId } = req.params;
    const intialData = req.body;

    try{
        await db.collection('match_events').doc(matchId).set({
            ...intialData,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: 'Match started!' });
    }
    catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to start match' });
    }
};

export const recordGoal = async (req, res) => {
    const { matchId } = req.params;
    const {time, team, player} = req.body;

    if (!team || !player || time === undefined){
        return res.status(400).json({error: "team, player, and time are required" });
    }
    try{
        const matchRef = db.collection("match_events").doc(matchId);

        await matchRef.update({
            goals: admin.firestore.FieldValue.arrayUnion({
                time,
                team,
                player
            }),
            
            [team === "home" ? "home_score" : "away_score"]: admin.firestore.FieldValue.increment(1),
            
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });

        res.json({ success: true, message: "Goal recorded!" });

    }
    catch(err){ 
        console.error(err);
        res.status(500).json({ error: "Failed to record goal" });
    }
};

export const recordSubstitution = async (req, res) => {
  const { matchId } = req.params;
  const { time, team, playerIn, playerOut } = req.body;

  if (!team || !playerIn || !playerOut || time === undefined) {
    return res.status(400).json({
      error: "team, playerIn, playerOut, and time are required",
    });
  }

  try {
    const matchRef = db.collection("match_events").doc(matchId);

    await matchRef.update({
      substitutions: admin.firestore.FieldValue.arrayUnion({
        time,
        team,
        playerIn,
        playerOut,
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Substitution recorded!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record substitution" });
  }
};

export const recordFoul = async (req, res) => {
  const { matchId } = req.params;
  const { time, team, player, card } = req.body;

  if (!team || !player || time === undefined) {
    return res
      .status(400)
      .json({ error: "team, player, and time are required" });
  }

  try {
    const matchRef = db.collection("match_events").doc(matchId);

    await matchRef.update({
      fouls: admin.firestore.FieldValue.arrayUnion({
        time,
        team,
        player,
        card: card || null, // "yellow" | "red" | null
      }),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.json({ success: true, message: "Foul recorded!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to record foul" });
  }
};