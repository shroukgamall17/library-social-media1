const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const router = express.Router();
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
const postController = require("../controllers/postController");

router.post("/:userId", upload.single("photo"), postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/single/:id", postController.getPostById);
router.delete("/:id", postController.deletePost);
router.patch("/:id",upload.single("photo"), postController.updatePost);
router.post("/like/:userId/:postId", postController.likePost);
router.post("/dislike/:userId/:postId", postController.dislikePost);
router.post('/save/:userId/:postId', postController.savePost);
router.post('/unsave/:userId/:postId', postController.unSavePost);
module.exports = router;
