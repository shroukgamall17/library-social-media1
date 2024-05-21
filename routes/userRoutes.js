const express = require('express');
const {getAllUsers,registerNewUser,loginUser
,deleteUser,getSingleUser}=require("../controllers/userController");
const { restrictTo, auth } = require('../middlewares/auth');
const router = express.Router();
// Login User
router.post( '/login', loginUser);
//register new User
router.post("/register", registerNewUser)
// get single user
router.get('/single/:id',getSingleUser )
//get All Users
router.get('/all', getAllUsers)
//delete user
router.delete('/:id', deleteUser)
module.exports=router;