//routes/matchClockRoutes.js
import express from "express";
import { 
  startMatchClock, 
  pauseMatchClock, 
  finishMatchClock, 
  getMatchClock, 
  deleteMatchClock 
} from "../controllers/matchClockController.js";

const router = express.Router();

// Start or resume the clock
router.post("/:matchId/start", startMatchClock);

// Pause with reason
router.post("/:matchId/pause", pauseMatchClock);

// Force stop (when match finished or 3 hours reached)
router.post("/:matchId/finish", finishMatchClock);

// Get current clock info
router.get("/:matchId", getMatchClock);

// Delete/Reset clock (admin only)
router.delete("/:matchId", deleteMatchClock);

export default router;