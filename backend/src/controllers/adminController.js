import admin from "../config/firebaseAdmin.js";

// Admin controller object
const adminController = {
  createMatch: async (req, res) => {
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
  },

  fetchTeams: async (req, res) => {
    try {
      const usersSnapshot = await admin.firestore().collection("teams").get();
      const teams = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        // ...doc.data(),
        teamName : doc.data().teamName ,
        shortNAme: doc.data().shortName,
        
      }));
      console.log(teams.teamName);
      
      res.status(200).json(teams);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
};

export default adminController;
