const express = require("express");
const mongoose = require("mongoose");
const userRoutes = require("./routes/userRoutes");
const postRoute = require("./routes/postRoute");
const commentRoute = require("./routes/commentRoute");
const bookRoutes = require("./routes/bookRoutes");
const cors = require("cors");
const dotenv = require("dotenv").config();
const app = express();
app.use(express.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:5174",
  })
);
app.use(express.urlencoded({ extended: false }));
mongoose
  .connect(process.env.CONNECTION_DB)
  .then(() => console.log("connected to db 😃"))
  .catch((err) => console.error(err));
app.use("/users", userRoutes);
app.use("/posts", postRoute);
app.use("/comment", commentRoute);
app.use("/books", bookRoutes);
app.use("/PostImg", express.static("postImages"));
app.listen(process.env.PORT, () =>
  console.log(`Example app listening on port ${process.env.PORT}!`)
);
