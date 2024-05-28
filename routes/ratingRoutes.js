const express = require("express");

const { addRating } = require("../controllers/ratingController");

const router = express.Router();

//add rating
router.post("/:userId/:bookId", addRating);

module.exports = router;
