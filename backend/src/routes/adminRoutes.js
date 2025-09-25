import express from 'express';

const router=express.Router()

import adminController from '../controllers/adminController.js';

router.post('/createMatch', adminController.createMatch);
router.patch('/updateMatchStatus/:id', adminController.updateMatchStatus);
router.patch('/updateScore/:id', adminController.updateScore);
router.post('/addMatchEvent/:id', adminController.addMatchEvent);
router.get('/allTeams',adminController.allTeams);
router.get('/teams/:teamName/players',adminController.getPlayersByTeamName);

export default router;