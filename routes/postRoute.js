const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const postController = require("../controllers/postController");
const { auth, restrictTo } = require("../middlewares/auth.js");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "postImages");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage: storage });

router.post("/", upload.single("image"), auth, postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/single/:id", postController.getPostById);
router.delete("/:id", postController.deletePost);
router.patch("/:id", upload.single("photo"), postController.updatePost);
router.post("/like/:userId/:postId", postController.likePost);
router.post("/dislike/:userId/:postId", postController.dislikePost);
router.post("/save/:userId/:postId", postController.savePost);
router.post("/unsave/:userId/:postId", postController.unSavePost);
module.exports = router;
