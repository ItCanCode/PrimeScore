//sets up /api/news endpoint
//uses your controller for handling logic

import express from "express";
import { getSportsNews } from "../controllers/newsController.js";  

const router = express.Router();

//Get /api/news
router.get("/", getSportsNews);

export default router;

