const express=require('express')

const router=express.Router()
const adminController=require('../controllers/adminController')

router.post('/createMatch',adminController.createMatch)
module.exports = router;