const Post = require("../models/postModel");

//create a new post
exports.createPost = async (req, res) => {
  console.log(req.body);
  const { userId, description, type } = req.body;

  try {
    const newPost = new Post({
      userId,
      description,
      type,
      comments: [],
      likes: [],
    });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate("comments").populate("likes");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get post by id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate([
      //   "comments",
      "likes",
    ]);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updatePost = async (req, res) => {
  const { description } = req.body;
  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { description },
      { new: true }
    );
    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.params.id);
    if (!deletedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.likePost = async (req, res) => {
  try {
    console.log(req.params);
    const { userId, postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.likes.includes(userId)) {
      return res.status(400).json({ message: "You already liked this post" });
    }

    post.likes.push(userId);
    // post.dislikes = post.dislikes.filter((id) => id.toString() !== userId);

    await post.save();

    res.status(200).json({ message: "Liked post successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.dislikePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // if (post.dislikes.includes(userId)) {
    //   return res
    //     .status(400)
    //     .json({ message: "You already disliked this post" });
    // }

    post.likes = post.likes.filter((id) => id.toString() !== userId);

    await post.save();

    res.status(200).json({ message: "Disliked post successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
