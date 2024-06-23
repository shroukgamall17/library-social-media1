const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
let { promisify } = require("util");

const User = require("../models/userModel");

const nodemailer = require("nodemailer");
const crypto = require("crypto");
const { createNotification } = require("./notificationController");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({})
      .populate("favouriteBooks")
      .sort({ createdAt: -1 })
      .select(["-password", "-confirmPassword"]);
    res.status(201).json({
      message: "Successfully fetched all the users",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// const registerNewUser = async (req, res) => {
//   try {
//     const files = req.file;
//     let photo = '';

//     if (files) {
//       photo = files.filename;
//     }

//     const { name, email, password, confirmPassword,role } = req.body;
//       // Ensure all required fields are provided
//   if (!name || !email || !password || !confirmPassword ) {
//     return res.status(400).json({ message: "All fields are required" });
//   }
//     const oldUser = await userModel.findOne({ email });
//     if (oldUser) {
//       return res.status(409).json("email already exist");
//     }
//     // Check if password and confirmPassword match
//     if (password !== confirmPassword) {
//       return res.status(400).json({ message: "Passwords do not match" });
//     }
//     const hashedPassword = await bcrypt.hash(password, 10);

//     const createUser = await userModel.create({
//       name,
//       email,
//       photo,
//       role,
//       confirmPassword: hashedPassword,
//       password: hashedPassword,
//     });

//     res.status(200).json(createUser);
//   } catch (err) {
//     res.status(409).json({ message: err.message });
//   }
// };

// const loginUser = async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) {
//     return res.status(400).json({ msg: "Please enter email and password" });
//   }
//   const user = await userModel.findOne({ email: email });
//   if (!user) {
//     return res.status(400).json({ msg: "invalid email" });
//   }
//   let isValid = await bcrypt.compare(password, user.password);
//   if (!isValid) {
//     return res.status(400).json({ msg: "Invalid Password" });
//   }
//   //Create JWT
//   let token = jwt.sign(
//     { data: { email: user.email, id: user._id } },
//     process.env.SECRET_KEY
//   );
//   res.json({ message: "success", token: token });
// };

const deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const data = await User.findByIdAndDelete(id);
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

    // console.log(req.params);
    const singleUser = await User.findById(id).select([
      "-password",
      "-confirmPassword",
    ]);
    res.json(singleUser);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    const { name } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );
    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const searchByName = async (req, res) => {
  try {
    const { name } = req.query;
    const users = await User.find({ name: name }).select([
      "-password",
      "-confirmPassword",
    ]);

    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const upToAdmin = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateUser = await User.findByIdAndUpdate(
      userId,
      { role: "admin" },

      { new: true }
    ).select(["-password", "-confirmPassword"]);

    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const downToUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const updateUser = await User.findByIdAndUpdate(
      userId,
      { role: "user" },
      { new: true }
    ).select(["-password", "-confirmPassword"]);

    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const filterWithUser = async (req, res) => {
  try {
    const users = await User.find({ role: "user" }).count();

    res.status(201).json({
      message: "Successfully fetched all the users",
      data: users,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateUserPhoto = async (req, res) => {
  try {
    const { id } = req.params;
    let photo = "";
    if (req.file != undefined) {
      photo = req.file.filename;
    }
    //const { name, phone, government } = req.body;

    const updateUser = await User.findByIdAndUpdate(
      id,
      { photo },
      { new: true }
    );
    if (!updateUser) {
      res.status(404).json("No user with this Id found.");
    }
    res.status(200).json({ user: updateUser });
  } catch (err) {
    res.status(500).json("Error updating the User");
  }
};

const followUser = async (req, res) => {
  try {
    const { userId, followUserId } = req.params;

    // Find the user who is being followed
    const followUser = await User.findById(followUserId);
    if (!followUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the user who is following
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if already following
    if (user.following.includes(followUserId)) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // Add the followed user to the following list
    user.following.push(followUserId);
    await user.save();

    // Add the follower to the followed user's followers list
    followUser.followers.push(userId);
    await followUser.save();
    await createNotification(
      userId,
      followUserId,
      "follow",
      `${user.name} followed you`
    );
    res.status(200).json({ message: "Followed user successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

const unfollowUser = async (req, res) => {
  const { userId, unfollowUserId } = req.params;

  if (!userId || !unfollowUserId) {
    return res.status(400).send("User IDs are required.");
  }

  try {
    const user = await User.findById(userId);
    const unfollowUser = await User.findById(unfollowUserId);

    if (!user || !unfollowUser) {
      return res.status(404).send("User not found.");
    }

    user.following = user.following.filter(
      (id) => id.toString() !== unfollowUserId
    );
    unfollowUser.followers = unfollowUser.followers.filter(
      (id) => id.toString() !== userId
    );

    await user.save();
    await unfollowUser.save();

    res.status(200).send("Unfollowed successfully.");
  } catch (err) {
    res.status(500).send("Server error.");
  }
};
const profile = async (req, res) => {
  try {
    console.log("profile");
    // const { token } = req.cookies;
    // if (!token) return res.status(404).json(null);
    // let {
    //   data: { id },
    // } = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    const user = await User.findById(req.user.id).populate("favouriteBooks");
    console.log(user);
    res.status(200).json(user);
  } catch (error) {
    console.log("profile", error);
    res.status(400).json({ error: error.message });
  }
};
module.exports = {
  getAllUsers,
  getSingleUser,
  deleteUser,
  updateUser,
  searchByName,
  upToAdmin,
  downToUser,
  filterWithUser,
  updateUserPhoto,
  followUser,
  unfollowUser,
  profile,
};
