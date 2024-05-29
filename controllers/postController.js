const Post = require("../models/postModel");
const User = require("../models/userModel");


exports.createPost = async (req, res) => {
  try {
    const files = req.file;
    let photo = "";

    if (files) {
      photo = files.filename;
    }
    //console.log(req.body);
    const { description, type } = req.body;
    const { userId } = req.params;
    // Check if required fields are missing
    if (!description || !userId) {
      return res.status(400).json({
        message: "userId, description are required fields.",
      });
    }

    // Create the new post
    const newBost = await Post.create({
      userId,
      type,
      description,
      photo
    });

    await User.findByIdAndUpdate(
      userId,
      { $push: { posts: newBost._id } },
      { new: true }
    );

    res.status(200).json({ message: "Added successfully", data: newBost });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//get all posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find().populate(["likes"]);
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get post by id
exports.getPostById = async (req, res) => {
  console.log('fdfdgfd')
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
  try {
    const { description } = req.body;
    let photo = "";
    if (req.file != undefined) {
      photo = req.file.filename;
    }
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { description,photo },
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

exports.savePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res.status(400).json({ message: "User ID and Post ID are required." });
    }

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    // Add the post to the user's posts array if it's not already there
    const user = await User.findByIdAndUpdate(
      userId,
      { $addToSet: { savedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Post added to user's posts.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.unSavePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res.status(400).json({ message: "User ID and Post ID are required." });
    }

    // Remove the post from the user's favorite posts array
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { savedPosts: postId } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Post removed from favorites.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
