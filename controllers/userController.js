const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");

const getAllUsers = async (req, res) => {
    try {
      const users = await userModel.find({}).sort({ createdAt: -1 }).select(['-password','-confirmPassword']);
      res.status(201).json({
        message: "Successfully fetched all the users",
        data: users,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  };

  const registerNewUser = async (req, res) => {
    try {
      const { name, email, password, confirmPassword,role } = req.body;
      const oldUser = await userModel.findOne({ email });
      if (oldUser) {
        return res.status(409).json("email already exist");
      }
      // Check if password and confirmPassword match
      if (password !== confirmPassword) {
        return res.status(400).json({ message: "Passwords do not match" });
      }
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const createUser = await userModel.create({
        name,
        email,
        role,
        confirmPassword: hashedPassword,
        password: hashedPassword,
      });
  
      res.status(200).json(createUser);
    } catch (err) {
      res.status(409).json({ message: err.message });
    }
  };

  const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter email and password" });
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ msg: "invalid email" });
    }
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ msg: "Invalid Password" });
    }
    //Create JWT
    let token = jwt.sign(
      { data: { email: user.email, id: user._id } },
      process.env.SECRET_KEY
    );
    res.json({ message: "success", token: token });
  };
  
  const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
      const data = await userModel.findByIdAndDelete(id);
      if (!data) {
        return res.status(404).json("Id Not Found");
      }
      res.status(200).json("User Deleted Successfully");
    } catch (error) {
      return res.status(500).json(error.message);
    }
  };


  const getSingleUser = async (req, res) => {
    try {
      const { id } = req.params;
      console.log(req.params);
      const singleUser = await userModel.findById(id).select(['-password','-confirmPassword']);
      res.json(singleUser);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  const updateUser = async (req, res) => {
    try {
      const {id} = req.params;
      const { name} = req.body;
     
      const updateUser = await userModel.findByIdAndUpdate(
        id,
        {name},
        { new: true }
      );
      if (!updateUser) {
        res.status(404).json('No user with this Id found.');
      }
      res.status(200).json({ user: updateUser });
    } catch (err) {
      res.status(500).json('Error updating the User');
    }
  };

  const searchByName = async (req, res) => {
    try {
      const { name } = req.query;
      const users = await userModel.find({ name: name }).select(['-password','-confirmPassword']);
  
      res.json(users);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };
  
  const upToAdmin=async(req,res)=>{
    try {
      const {userId} = req.params;
      const updateUser = await userModel.findByIdAndUpdate(
        userId,
        { role:  "admin"},
  
        { new: true }
      ).select(['-password','-confirmPassword']);
     
      if (!updateUser) {
        res.status(404).json('No user with this Id found.');
      }
      res.status(200).json({ user: updateUser });
    } catch (err) {
      res.status(500).json('Error updating the User');
    }
  }
  module.exports = {
    getAllUsers,
    registerNewUser,
    loginUser,
    getSingleUser,
    deleteUser,
    updateUser,
    searchByName,
    upToAdmin
  };
  