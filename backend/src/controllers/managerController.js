import admin from "../config/firebaseAdmin.js";
// managerController.js
const managerController = {
  createTeam: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { teamName, shortName, sportType, city } = req.body;
      const docRef = admin.firestore().collection("teams").doc();
      const teamId = docRef.id;

      await docRef.set({
        teamId,
        teamName,
        shortName,
        sportType,
        city,
        createdBy: uid,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(201).json({ message: "Team created", teamId });
    } catch (error) {
      console.error("Error creating team:", error);
      res.status(500).json({ error: error.message });
    }
  },
  
    addPlayers: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { teamId, players } = req.body;

      if (!teamId || !players || !Array.isArray(players)) {
        return res.status(400).json({ error: "teamId and players[] required" });
      }

      // Check that this user owns the team
      const teamRef = admin.firestore().collection("teams").doc(teamId);
      const teamSnap = await teamRef.get();

      if (!teamSnap.exists) {
        return res.status(404).json({ error: "Team not found" });
      }

      if (teamSnap.data().createdBy !== uid) {
        return res.status(403).json({ error: "Not authorized to add players to this team" });
      }

      // Add players in a batch to the "players" collection (top-level)
      const batch = admin.firestore().batch();
      const playersCollection = admin.firestore().collection("players");

      const newPlayers = players.map((player) => {
        const playerRef = playersCollection.doc();
        const playerId = playerRef.id;

        batch.set(playerRef, {
          playerId,
          teamId,
          name: player.name,
          position: player.position,
          number: player.number,
          age: player.age,
          createdBy: uid,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return { ...player, playerId, teamId };
      });

      await batch.commit();

      res.status(201).json({ message: "Players added successfully", players: newPlayers });
    } catch (error) {
      console.error("Error adding players:", error);
      res.status(500).json({ error: error.message });
    }
  },
  myTeam: async (req, res) => {
    try {
      const uid = req.user.uid; 
      const teamsRef = admin.firestore().collection("teams");
      const snapshot = await teamsRef.where("createdBy", "==", uid).limit(1).get();
      if (snapshot.empty) {
        return res.status(200).json({ hasTeam: false });
      }

      const team = snapshot.docs[0].data();
      return res.status(200).json({ hasTeam: true, team });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getPlayers: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { teamId } = req.params;

      const teamRef = admin.firestore().collection("teams").doc(teamId);
      const teamSnap = await teamRef.get();

      if (!teamSnap.exists) {
        return res.status(404).json({ error: "Team not found" });
      }

      if (teamSnap.data().createdBy !== uid) {
        return res.status(403).json({ error: "Not authorized to view players of this team" });
      }

      const playersSnap = await admin.firestore()
        .collection("players")
        .where("teamId", "==", teamId)
        .get();

      const players = playersSnap.docs.map(doc => doc.data());

      res.status(200).json({ players });
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: error.message });
    }
  },
  removePlayer: async (req, res) => {
    try {
      const uid = req.user.uid;
      const { playerId } = req.params;

      const playerRef = admin.firestore().collection("players").doc(playerId);
      const playerSnap = await playerRef.get();

      if (!playerSnap.exists) {
        return res.status(404).json({ error: "Player not found" });
      }

      const playerData = playerSnap.data();

      const teamRef = admin.firestore().collection("teams").doc(playerData.teamId);
      const teamSnap = await teamRef.get();

      if (!teamSnap.exists) {
        return res.status(404).json({ error: "Team not found" });
      }

      if (teamSnap.data().createdBy !== uid) {
        return res.status(403).json({ error: "Not authorized to remove players from this team" });
      }

      await playerRef.delete();

      res.status(200).json({ message: "Player removed successfully", playerId });
    } catch (error) {
      console.error("Error removing player:", error);
      res.status(500).json({ error: error.message });
    }
  },
};

export default managerController;