// routes/userRoutes.js

import express from 'express';
import { getAllUsers, createUser, getCurrentUser, updateUser } from '../controllers/userController.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.get('/me', authMiddleware ,getCurrentUser);
router.put('/me', authMiddleware, updateUser);

export default router;