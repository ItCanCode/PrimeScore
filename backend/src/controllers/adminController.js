import admin from "../config/firebaseAdmin.js";
// adminController.js
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
};

export default adminController;