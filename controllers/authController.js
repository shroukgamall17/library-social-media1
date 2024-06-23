const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
let { promisify } = require("util");
const sendEmail = require("../utils/email");
const crypto = require("crypto");

exports.signup = async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;
    console.log(req.body);
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (await User.findOne({ email })) {
      return res.status(409).json("email already exist");
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      confirmPassword: hashedPassword,
    });
    const token = jwt.sign(
      {
        data: {
          email: newUser.email,
          id: newUser._id,
          name: newUser.name,
          role: newUser.role,
        },
      },
      process.env.SECRET_KEY
    );
    res.cookie("token", token, { httpOnly: true }).status(201).json(newUser);
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials", error: error });
  }
};
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ msg: "Please enter email and password" });
    }
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(400).json({ message: "invalid email or password" });
    }
    let isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ msg: "Invalid email or password" });
    }
    const token = jwt.sign(
      {
        data: {
          email: user.email,
          id: user._id,
          name: user.name,
          role: user.role,
        },
      },
      process.env.SECRET_KEY
    );
    res.cookie("token", token, { httpOnly: true }).status(200).json({ user });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Invalid credentials", error });
  }
};
exports.logout = async (req, res) => {
  res.clearCookie("token").status(200).json({
    message: "Logged out successfully",
  });
};
exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json({ msg: "there is no user with that email " });
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  const resetURL = `${req.protocol}://${req.get(
    "host"
  )}/users/resetPassword/${resetToken}`;

  const message = `Forgot your password? Submit a PATCH request with your new password and passwordConfirm to: ${resetURL}.\nIf you didn't forget your password, please ignore this email!`;
  try {
    await sendEmail({
      email: user.email,
      subject: "Your password reset token (valid for 10 min)",
      message,
    });

    res.status(200).json({
      status: "success",
      message: "Token sent to email!",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return res
      .status(400)
      .json({ message: "There was an error sending the email. Try again!" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });
    if (!user) {
      return res.json({ message: "Token is invalid or expired" });
    }

    if (req.body.password === req.body.confirmPassword) {
      user.password = await bcrypt.hash(req.body.password, 10);
      user.confirmPassword = await bcrypt.hash(req.body.confirmPassword, 10);
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save();
    }
    const token = jwt.sign(
      {
        data: { email: user.email, id: user._id, name: user.name },
      },
      process.env.SECRET_KEY
    );
    res.cookie("token", token, { httpOnly: true }).status(200).json({ user });
  } catch (error) {
    res.status(400).json({ message: "Invalid credentials", error });
  }
};
exports.updatePassword = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("+password");
    if (!(await bcrypt.compare(user.password, req.body.currentPassword))) {
      return res.status(400).json({ message: "password incorrect" });
    }
    user.password = req.body.password;
    user.passwordConfirm = req.body.passwordConfirm;
    await user.save();
    res.status(200).json({ user });
  } catch (error) {
    res.status(400).json({ error });
  }
};
exports.auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;
    if (!token) return res.status(404).json({ message: "please login" });
    let { data } = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
    req.user = { ...data };
    req.user.role = data.role;
    console.log(req.user);
    console.log("*");
    next();
  } catch (error) {
    console.log(error);
    res.status(400).json({ error });
  }
};
exports.restrictTo =
  (...roles) =>
  (req, res, next) => {
    console.log(roles);
    console.log(req.role);
    if (!roles.includes(req.role)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to view this resource" });
    }
    next();
  };
