import express from 'express';

import { startMatch, recordGoal, recordFoul, recordSubstitution } from '../controllers/feedController.js';
const router = express.Router();

router.post('/:matchId/start', startMatch);
router.post('/:matchId/goal', recordGoal);
router.post("/:matchId/substitution", recordSubstitution);
router.post("/:matchId/foul", recordFoul);


export default router;