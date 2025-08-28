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
};

export default managerController;