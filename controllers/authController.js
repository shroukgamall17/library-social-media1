const userModel = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let { promisify } = require("util");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (await userModel.findOne({ email })) {
      return res.status(409).json("email already exist");
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });
    const token = jwt.sign(
      {
        data: { email: newUser.email, id: newUser._id, name: newUser.name },
      },
      process.env.SECRET_KEY
    );
    res
      .status(200)
      .cookies("token", token, { httpOnly: true })
      .json({ newUser });
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials", error });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter email and password" });
    }
    const user = await userModel.findOne({ email: email });
    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }
    const token = jwt.sign(
      {
        data: { email: user.email, id: user._id, user: newUser.name },
      },
      process.env.SECRET_KEY
    );
    res.status(200).cookies("token", token, { httpOnly: true }).json({ user });
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials", error });
  }
};
exports.auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(404).json({ message: "please login" });
    let { email, id, name } = await promisify(jwt.verify)(
      token,
      process.env.SECRET_KEY
    );
    req.user = { email, id, name };
    next();
  } catch (error) {
    res.status(400).json({ error });
  }
};
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    if (!roles.includes(req.role)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to view this resource" });
    }
    next();
  };
