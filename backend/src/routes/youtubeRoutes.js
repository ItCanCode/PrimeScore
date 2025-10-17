import express from "express";
import { getSportsShorts } from "../controllers/youtubeController.js";

const router = express.Router();

router.get("/shorts", getSportsShorts);

export default router;
