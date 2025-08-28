// routes/userRoutes.js

import express from 'express';
import multer from "multer";
import { getAllUsers, createUser, getCurrentUser, updateUser, uploadImage } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();
const upload = multer({storage: multer.memoryStorage() });

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/me', authMiddleware ,getCurrentUser);
router.put('/me', authMiddleware, updateUser);
router.post('/upload', upload.single("picture"), uploadImage);

export default router;