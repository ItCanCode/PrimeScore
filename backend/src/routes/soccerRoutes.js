import express from "express";
import { getMatches } from "../controllers/soccerController.js";

const router = express.Router();

router.get("/matches", getMatches);

export default router;