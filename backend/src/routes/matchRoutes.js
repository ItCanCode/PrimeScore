import LiveSport from '../controllers/matchController.js'
import express from 'express';
const router = express.Router();
const { getLiveMatches } = require('../services/matchService');

router.post("/storeMatch",LiveSport);

router.get('/live', async (req, res) => {
  try {
    const matches = await getLiveMatches();
    res.json(matches);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;