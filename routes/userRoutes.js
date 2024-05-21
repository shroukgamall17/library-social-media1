const express = require('express');
const {getAllUsers,registerNewUser,loginUser
,deleteUser,getSingleUser,updateUser,searchByName,upToAdmin,downToUser}=require("../controllers/userController");
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
//update user
router.patch('/:id',updateUser)
//search by name
router.get('/search',searchByName)
//up to admin
router.patch('/up/:userId',upToAdmin)
///down to user
router.patch('/down/:userId',downToUser)
module.exports=router;