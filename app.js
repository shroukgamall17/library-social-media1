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
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5173",
  })
);

// app.use(bodyParser.json());

app.use(express.urlencoded({ extended: false }));
mongoose
  .connect(process.env.CONNECTION_DB)
  .then(() => console.log("connected to db 😃"))
  .catch((err) => console.error(err));
app.use("/users", userRoutes);
app.use("/posts", postRoute);
app.use("/comment", commentRoute);
app.use("/books", bookRoutes);
app.use("/ratings", ratingRoutes);
app.use("/authors", authorRoutes);
app.use("/comment", commentRoute);
app.use("/notification", notificationRoutes);
app.use("/image", express.static("bookImage"));
app.use("/image", express.static("userImages"));
// app.use("/books", bookRoutes);

app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);
