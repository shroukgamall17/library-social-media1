const express = require("express");
const multer = require("multer");
const path = require("path");
const fs =require('fs')
const {
  getAllUsers,
  registerNewUser,
  loginUser,
  deleteUser,
  getSingleUser,
  updateUser,
  searchByName,
  upToAdmin,
  downToUser,
  filterWithUser,
  updateUserPhoto
} = require("../controllers/userController");
const { restrictTo, auth } = require("../middlewares/auth");
//upload image
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = path.join(__dirname, '../userImages');
      // تأكد من أن المجلد موجود، وإذا لم يكن موجودًا، قم بإنشائه
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
    }
  });
const upload = multer({ storage: storage });
const router = express.Router();
// Login User
router.post("/login", loginUser);
//register new User
router.post("/register",upload.single('photo'), registerNewUser);
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
///update docImg user
router.patch("/photo/:id",upload.single("photo"), updateUserPhoto);
module.exports = router;
