import express from 'express';
// routes/managerRoutes.js
const router=express.Router()
import managerController from '../controllers/managerController.js';

router.post('/createTeam',managerController.createTeam);
router.post('/addPlayers', managerController.addPlayers);

export default router;