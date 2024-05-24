const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const {
  getAllUsers,
  deleteUser,
  getSingleUser,
  updateUser,
  searchByName,
  upToAdmin,
  downToUser,
  filterWithUser,
  updateUserPhoto,
  followUser,
  unfollowUser,
} = require("../controllers/userController");
const authController = require("../controllers/authController");
const { restrictTo, auth } = require("../middlewares/auth");
//upload image
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../userImages");
    // تأكد من أن المجلد موجود، وإذا لم يكن موجودًا، قم بإنشائه
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  },
});
const upload = multer({ storage: storage });
const router = express.Router();
// Login User
router.post("/login", authController.login);
//register new User
router.post("/register", authController.signup);
// get single user
router.get("/single/:id", getSingleUser);
//get All Users
router.get("/all", getAllUsers);
//delete user
router.delete("/:id", deleteUser);
//update user
router.patch("/:id", updateUser);
//search by name
router.get("/search", searchByName);
//up to admin
router.patch("/up/:userId", upToAdmin);
///down to user
router.patch("/down/:userId", downToUser);
//get all users
router.get("/user", filterWithUser);
///update docImg us.er
router.patch("/photo/:id", upload.single("photo"), updateUserPhoto);
//follow user
router.post("/follow/:userId/:followUserId", followUser);
//unfollow user
router.post("/unfollow/:userId/:unfollowUserId", unfollowUser);
// request reset password
router.post('/requestPasswordReset', requestPasswordReset);
//reset password
router.post('/updatePassword/:token', resetPassword);
module.exports = router;
