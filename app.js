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

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

//socket io
const server = require("http").createServer(app);
const io = require("socket.io")(server, {
  cors: {
    origin: "http://localhost:5173", // Frontend URL
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });

  socket.on("leave", (userId) => {
    socket.leave(userId);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Test notification (for demonstration purposes, remove in production)
setTimeout(() => {
  sendNotification("userId123", "This is a new notification!");
}, 5000);

const sendNotification = (userId, notification) => {
  io.to(userId).emit("newNotification", notification);
};

app.post("/send-notification", async (req, res) => {
  const { userId, message, details } = req.body;
  const notification = new Notification({ user: userId, message, details });

  try {
    await notification.save();
    sendNotification(userId, notification);
    res.status(201).json(notification);
  } catch (error) {
    console.error("Failed to save notification:", error);
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
app.use("/image", express.static("userImages"));
app.use("/postcard", express.static("postImages"));
// app.use("/books", bookRoutes);


server.listen(process.env.PORT, () => console.log(`App listening on port ${process.env.PORT}!`));
