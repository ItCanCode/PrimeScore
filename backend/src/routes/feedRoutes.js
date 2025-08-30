import express from 'express';

import { startMatch, recordGoal } from '../controllers/feedController.js';
const router = express.Router();

router.post('/:matchId/start', startMatch);
router.put('/:matchId/goal',recordGoal);

export default router;