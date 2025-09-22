import express from 'express';
// routes/managerRoutes.js
const router=express.Router()
import managerController from '../controllers/managerController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

router.post('/createTeam', authMiddleware,managerController.createTeam);
router.post('/addPlayers', authMiddleware, managerController.addPlayers);
router.get('/myTeam', authMiddleware, managerController.myTeam);
router.get("/players/:teamId", authMiddleware, managerController.getPlayers);
router.delete("/player/:playerId", authMiddleware, managerController.removePlayer);

export default router;