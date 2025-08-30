import LiveSport from '../controllers/matchController.js'
import express from 'express';
const router = express.Router();
router.post("/storeMatch",LiveSport);
export default router;