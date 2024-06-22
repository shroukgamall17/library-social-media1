const express = require("express");

const { addRating } = require("../controllers/ratingController");
const authController = require("../controllers/authController");
const router = express.Router();

//add rating
router.post("/:userId/:bookId",authController.auth,
    authController.restrictTo("admin", "user"), addRating);

module.exports = router;
