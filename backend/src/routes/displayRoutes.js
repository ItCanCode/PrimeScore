import express from 'express';
import { getMatchStats } from '../controllers/displayController.js';

const router = express.Router();

// Route: Get live stats for a match by matchId
// Example: GET /api/display/matchStats/:id
router.get('/matchStats/:id', getMatchStats);

export default router;
