import express from 'express';
import { getmatchEvents, getMatchEventsById  } from '../controllers/displayController.js';

const router = express.Router();

// Route: Get live stats for a match by matchId
// Example: GET /api/display/matchStats/:id
router.get("/display-matches", getmatchEvents);
router.get('/match-events/:id', getMatchEventsById);

export default router;
