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
  profile,
} = require("../controllers/userController");

const authController = require("../controllers/authController");

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

//logout
router.post("/logout", authController.logout);

//register new User
router.post("/register", authController.signup);

//reset password
router.post("/forgotPassword", authController.forgotPassword);
router.post("/resetPassword/:token", authController.resetPassword);

//update password
router.post(
  "/updatePassword",
  // authController.auth,
  authController.updatePassword
);

//get All Users
router.get(
  "/",
  //authController.auth,
  getAllUsers
);
// router.delete("/:id", deleteUser);
// router.patch("/:id", updateUser);
//search by name
router.get("/search", authController.auth, searchByName);
//up to admin
router.patch(
  "/up/:userId",
  authController.auth,
  authController.restrictTo("admin"),
  upToAdmin
);
///down to user
router.patch(
  "/down/:userId",
  authController.auth,
  authController.restrictTo("admin"),
  downToUser
);
//get all users
router.get(
  "/user",
  authController.auth,
  authController.restrictTo("admin"),
  filterWithUser
);
///update docImg us.er
router.patch(
  "/photo/:id",
  upload.single("photo"),
  // authController.auth,
  // authController.restrictTo("admin", "user"),
  updateUserPhoto
);
//follow user
router.post(
  "/follow/:userId/:followUserId",
  // authController.auth,
  // authController.restrictTo("admin", "user"),
  followUser
);
//unfollow user
router.post(
  "/unfollow/:userId/:unfollowUserId",
  // authController.auth,
  // authController.restrictTo("admin", "user"),
  unfollowUser
);
router.get("/profile", authController.auth, profile);
// get single user
router.get("/:id", authController.auth, getSingleUser);

//update user & delete user
router
  .route("/:id")
  .delete(authController.auth, authController.restrictTo("admin"), deleteUser)
  .patch(
    authController.auth,
    authController.restrictTo("admin", "user"),
    updateUser
  );
module.exports = router;
