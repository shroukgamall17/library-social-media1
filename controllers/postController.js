const Post = require("../models/postModel");
const User = require("../models/userModel");
const { createNotification } = require("./notificationController");
//Create a new post
exports.createPost = async (req, res) => {
  const { description, type } = req.body;

  const imageURL = req.file ? req.file.filename : "";

  const { book, rating } = req.body;

  try {
    const newPostData = {
      userId: req.user.id,
      type,
      imageURL,
      description,
    };

    if (book) {
      newPostData.book = book;
    }

    if (rating) {
      newPostData.rating = rating;
    }

    const newPost = new Post(newPostData);

    const savedPost = await newPost.save();

    const postingUser = await User.findById(req.user.id).select('name followers');
    //const userFollowers = await User.findById(req.user.id).select('followers');
    const userName = postingUser.name;
    const followersIds = postingUser.followers;

    for (const followerId of followersIds) {
      try {
        await createNotification(req.user.id, followerId, 'new_post', `${userName} has posted a new post`);
        console.log(`Notification sent to followerId: ${followerId}`);
      } catch (notificationError) {
        console.error(`Failed to send notification to followerId: ${followerId}`, notificationError);
      }
    }

    // const notifications = followersIds.map(followerId =>
    //   createNotification(req.user.id, followerId, 'new_post', 'A user you follow has posted a new post')
    // );
    // await Promise.all(notifications);

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// get ALl posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate(["likes"])
      // .populate(["comments"])
      .populate("userId");
    res.status(200).json(posts);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// get certain post by id
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id).populate([
      { path: "comments", populate: [{ path: "userId" }] },
      "likes",
      "userId",
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
      { description, photo },
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
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// update a post
exports.updatePost = async (req, res) => {
  const { userId, description, type, book, rating } = req.body;
  const imageURL = req.file ? req.file.filename : "";

  try {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.id,
      { userId, description, type, imageURL, book, rating },
      { new: true }
    );
    if (!updatedPost)
      return res.status(404).json({ message: "Post not found" });
    res.status(200).json(updatedPost);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// like a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    if (!post.likes.includes(req.params.userId)) {
      post.likes.push(req.params.userId);
      await post.save();

       // Fetch the user's details
       const user = await User.findById(req.params.userId);
       if (!user) return res.status(404).json({ message: "User not found" });
      console.log("Sender ID:", req.params.userId);
      console.log("Receiver ID (Post Owner):", post.userId);

      //await createNotification(req.params.userId, post.userId, 'like', `${user.name} liked your post`);
      if (req.params.userId !== post.userId.toString()) {
        await createNotification(req.params.userId, post.userId, 'like', `${user.name} liked your post`);
      }
      res.status(200).json({ message: "Post liked" });
    } else {
      res.status(400).json({ message: "User already liked this post" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// dislike a post
exports.dislikePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);
    if (!post) return res.status(404).json({ message: "Post not found" });

    post.likes = post.likes.filter((userId) => userId !== req.params.userId);
    await post.save();
    res.status(200).json({ message: "Post disliked" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.savePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required." });
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
    const savingUser = await User.findById(userId);
    if (!savingUser) return res.status(404).json({ message: "User not found" });
    await createNotification(userId, post.userId, 'save', `${savingUser.name} saved your post`);

    res
      .status(200)
      .json({ message: "Post added to user's posts.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unSavePost = async (req, res) => {
  try {
    const { userId, postId } = req.params;

    if (!userId || !postId) {
      return res
        .status(400)
        .json({ message: "User ID and Post ID are required." });
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

    res
      .status(200)
      .json({ message: "Post removed from favorites.", data: user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
