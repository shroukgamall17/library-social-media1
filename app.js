// const express = require("express");
// const mongoose = require("mongoose");
// const userRoutes = require("./routes/userRoutes");
// const postRoute = require("./routes/postRoute");
// const commentRoute = require("./routes/commentRoute");
// const bookRoutes = require("./routes/bookRoutes");
// const ratingRoutes = require("./routes/ratingRoutes");
// const authorRoutes = require("./routes/authorRoutes");
// const notificationRoutes = require("./routes/notificationRoutes");
// const cors = require("cors");
// const dotenv = require("dotenv").config();
// const bodyParser = require("body-parser");
// const cookieParser = require("cookie-parser");
// const jwt = require("jsonwebtoken"); // Ensure jwt is imported
// const { promisify } = require("util");
// const Notification = require("./models/notificationModel");
// const notificationController = require("./controllers/notificationController");
// const { Conversation } = require("./models/conversionModel"); // Fixed the typo
// const { Message } = require("./models/messageModel");
// const User = require("./models/userModel");

// const app = express();
// app.use(express.json());
// app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(express.urlencoded({ extended: false }));

// app.use(
//   cors({
//     credentials: true,
//     origin: "http://localhost:5173",
//     methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
//   })
// );

// // Socket.io setup
// const server = require("http").createServer(app);
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:5173", // Frontend URL
//     methods: ["GET", "POST"],
//   },
// });

// // Initialize socket in the notification controller
// notificationController.initializeSocket(io);

// const onlineUser = new Set();

// io.use(async (socket, next) => {
//   const token = socket.handshake.auth.token;
//   if (token) {
//     try {
//       const data = await promisify(jwt.verify)(token, process.env.SECRET_KEY);
//       socket.user = data;
//       next();
//     } catch (error) {
//       console.log("Authentication error", error);
//       next(new Error("Authentication error"));
//     }
//   } else {
//     next(new Error("Authentication error"));
//   }
// });

// io.on("connection", (socket) => {
//   console.log("User connected", socket.id);
//   const user = socket.user;
//   if (user?._id) {
//     socket.join(user._id.toString());
//     onlineUser.add(user._id.toString());
//     io.emit("onlineUser", Array.from(onlineUser));
//   }

//   socket.on("join", (userId) => {
//     console.log(`User ${socket.id} joining room: ${userId}`);
//     socket.join(userId);
//   });

//   socket.on("leave", (userId) => {
//     console.log(`User ${socket.id} leaving room: ${userId}`);
//     socket.leave(userId);
//   });

//   socket.on("userId", async (userId) => {
//     const details = await User.findById(userId).select("-password");
//     const payload = {
//       _id: details._id,
//       name: details.name,
//       email: details.email,
//       profile_pic: details.profile_pic,
//       online: onlineUser.has(userId),
//     };
//     socket.emit("inform-user", payload);
//   });

//   socket.on("disconnect", () => {
//     console.log("User disconnected");
//     onlineUser.delete(user?._id?.toString());
//     io.emit("onlineUser", Array.from(onlineUser));
//   });

//   socket.on("previous-message", async (userIdMessage) => {
//     console.log("Fetching previous messages for:", userIdMessage);
//     const findConversationFirst = await Conversation.findOne({
//       $or: [
//         { sender: user._id, receiver: userIdMessage },
//         { sender: userIdMessage, receiver: user._id },
//       ],
//     }).populate("messages");
//     socket.emit("all-message", findConversationFirst?.messages || {});
//   });

//   socket.on("new-message", async (data) => {
//     console.log("New message:", data);
//     let findConversation = await Conversation.findOne({
//       $or: [
//         { sender: data.sender, receiver: data.receiver },
//         { sender: data.receiver, receiver: data.sender },
//       ],
//     });
//     if (!findConversation) {
//       findConversation = await Conversation.create({
//         sender: data.sender,
//         receiver: data.receiver,
//       });
//     }

//     const createMessage = await Message.create({
//       text: data.text,
//       imageUrl: data.imageUrl,
//       videoUrl: data.videoUrl,
//       msgByUser: data.msgByUser,
//       seen: false,
//     });

//     findConversation.messages.push(createMessage._id);
//     await findConversation.save();

//     const findNewConversation = await Conversation.findOne({
//       $or: [
//         { sender: data.sender, receiver: data.receiver },
//         { sender: data.receiver, receiver: data.sender },
//       ],
//     }).populate("messages");

//     io.to(data.sender).emit("all-message", findNewConversation.messages);
//     io.to(data.receiver).emit("all-message", findNewConversation.messages);
//   });

//   socket.on("sidebar", async (userIdSidebar) => {
//     const findConversationSidebar = await Conversation.find({
//       $or: [{ sender: userIdSidebar }, { receiver: userIdSidebar }],
//     })
//       .populate("sender")
//       .populate("receiver")
//       .populate("messages");

//     const sendReceiverConversation = findConversationSidebar.map((conv) => {
//       const countUnseen = conv.messages.reduce(
//         (prev, acc) => prev + (acc.seen ? 0 : 1),
//         0
//       );
//       return {
//         _id: conv._id,
//         sender: conv.sender,
//         receiver: conv.receiver,
//         lastMessage: conv.messages[conv.messages.length - 1],
//         countUnseenMessage: countUnseen,
//       };
//     });
//     socket.emit("messageSlider", sendReceiverConversation);
//   });
// });

// // Endpoint to send notification (for testing)
// app.post("/send-notification", async (req, res) => {
//   const { userId, message, details } = req.body;
//   const notification = new Notification({ user: userId, message, details });

//   try {
//     await notification.save();
//     notificationController.createNotification(null, userId, "info", message);
//     res.status(201).json(notification);
//   } catch (error) {
//     res.status(500).json({ message: "Failed to save notification" });
//   }
// });

// // Connect to MongoDB
// mongoose
//   .connect(process.env.CONNECTION_DB, {
//    // useNewUrlParser: true,
//     //useUnifiedTopology: true,
//   })
//   .then(() => console.log("Connected to DB 😃"))
//   .catch((err) => console.error("Failed to connect to DB", err));

// // Use routes
// app.use("/users", userRoutes);
// app.use("/posts", postRoute);
// app.use("/comments", commentRoute);
// app.use("/books", bookRoutes);
// app.use("/ratings", ratingRoutes);
// app.use("/authors", authorRoutes);
// app.use("/notifications", notificationRoutes);
// app.use("/image", express.static("bookImage"));
// app.use("/userImages", express.static("userImages"));
// app.use("/postcard", express.static("postImages"));

// // Start server
// server.listen(process.env.PORT, () =>
//   console.log(`App listening on port ${process.env.PORT}!`)
// );


////////////////////////////////////////////////////////////////////////////

const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const bookRoutes = require("./routes/bookRoutes");
const ratingRoutes = require("./routes/ratingRoutes");
const authorRoutes = require("./routes/authorRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const cors = require("cors");
const dotenv = require("dotenv").config();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const Notification = require("./models/notificationModel");
const notificationController =require('./controllers/notificationController')
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors(
    {
    credentials: true,
    origin: "http://localhost:5173",
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  }
)
);

//socket io
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});


// Initialize socket in the notification controller
notificationController.initializeSocket(io);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("join", (userId) => {
    console.log(`User ${socket.id} joining room: ${userId}`);
    socket.join(userId);
  });

  socket.on("leave", (userId) => {
    console.log(`User ${socket.id} leaving room: ${userId}`);
    socket.leave(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});




// Endpoint to send notification (for testing)
app.post("/send-notification", async (req, res) => {
  const { userId, message, details } = req.body;
  const notification = new Notification({ user: userId, message, details });

  try {
    await notification.save();
    notificationController.createNotification(null, userId, 'info', message);
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: "Failed to save notification" });
  }
});

mongoose
  .connect(process.env.CONNECTION_DB, {
    //useNewUrlParser: true,
    //useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to DB 😃"))
  .catch((err) => console.error("Failed to connect to DB", err));

app.use("/users", userRoutes);
app.use("/posts", postRoute);
app.use("/comments", commentRoute); 
app.use("/books", bookRoutes);
app.use("/ratings", ratingRoutes);
app.use("/authors", authorRoutes);
app.use("/notifications", notificationRoutes);
app.use("/image", express.static("bookImage"));
app.use("/userImages", express.static("userImages"));
app.use("/postcard", express.static("postImages"));
// app.use("/books", bookRoutes);


server.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`));
