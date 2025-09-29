
import express from 'express';
import {getRugbyFix,rugbyLive }from '../controllers/rugbyLiveController.js'
const router = express.Router();
router.post("/",rugbyLive);
router.get("/:date",getRugbyFix)
export default router;
