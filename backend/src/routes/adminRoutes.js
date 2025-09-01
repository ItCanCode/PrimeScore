import express from 'express';

const router=express.Router()
import { createMatch, updateMatchStatus, updateScore, addMatchEvent } from '../controllers/adminController.js';

router.post('/createMatch', createMatch);
router.patch('/updateMatchStatus/:id', updateMatchStatus);
router.patch('/updateScore/:id', updateScore);
router.post('/addMatchEvent/:id', addMatchEvent);

export default router;