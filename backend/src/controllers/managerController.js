import admin from "../config/firebaseAdmin.js";
// managerController.js
const managerController = {
  createTeam: async (req, res) => {
    try {
      const { teamName, shortName, sportType, city } = req.body;
      const docRef = admin.firestore().collection("teams").doc();
      const teamId = docRef.id;

      await docRef.set({
        teamId,
        teamName,
        shortName,
        sportType,
        city,
      });
      res.status(201).json({ message: "Team created", teamId });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  addPlayers: async (req, res) => {
    try {
      const { teamId, players } = req.body;
      if (!teamId || !players || !Array.isArray(players)) {
        return res.status(400).json({ error: "teamId and players[] required" });
      }

      const batch = admin.firestore().batch();
      const teamRef = admin.firestore().collection("teams").doc(teamId);

      players.forEach((player) => {
        const playerRef = teamRef.collection("players").doc();
        batch.set(playerRef, { name: player });
      });

      await batch.commit();

      res.status(201).json({ message: "Players added successfully" });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};

export default managerController;