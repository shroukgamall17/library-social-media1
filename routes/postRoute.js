const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");

router.post("/", postController.createPost);
router.get("/", postController.getAllPosts);
router.get("/single/:id", postController.getPostById);
router.delete("/:id", postController.deletePost);
router.put("/:id", postController.updatePost);
router.post("/like/:userId/:postId", postController.likePost);
router.post("/dislike/:userId/:postId", postController.dislikePost);

module.exports = router;
