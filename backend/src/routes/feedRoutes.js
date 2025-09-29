import express from "express";
import { startMatch, addEvent } from "../controllers/feedController.js";

const router = express.Router();

router.post("/:matchId/start", startMatch);
router.post("/:matchId/event", addEvent);


export default router;