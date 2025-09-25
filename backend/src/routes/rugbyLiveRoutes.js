import rugbyLive from '../controllers/rugbyLiveController.js';
import express from 'express';
const router = express.Router();
router.post("/",rugbyLive);
export default router;
