import express from 'express';

const router=express.Router()
import adminController from '../controllers/adminController.js';

router.post('/createMatch',adminController.createMatch)
export default router;