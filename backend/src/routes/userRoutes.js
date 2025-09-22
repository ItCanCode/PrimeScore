// routes/userRoutes.js

import express from 'express';
import multer from "multer";
import {  getCurrentUser, updateUser,getMatches, uploadImage } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({storage: multer.memoryStorage() });

// router.get('/', getAllUsers);
// router.post('/', createUser);
router.get('/me', authMiddleware ,getCurrentUser);
router.put('/me', authMiddleware, updateUser);
router.post('/upload', upload.single("picture"), uploadImage);
router.get('/viewMatches',getMatches)

export default router;