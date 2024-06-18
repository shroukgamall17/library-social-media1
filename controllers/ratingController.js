const Book = require("../models/bookModel");
const Rating = require("../models/ratingModel");
const { createNotification } = require("./notificationController");
const addRating = async (req, res) => {
  try {
    const { rating, review } = req.body;
    const { bookId, userId } = req.params;

    if (!bookId || !userId || !rating) {
      return res.status(400).json({ message: "Book ID, User ID, and Rating are required." });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5." });
    }

    const newRating = await Rating.create({
      book: bookId,
      user: userId,
      rating,
      review,
    });

    const book = await Book.findById(bookId).populate("authorId");

    if (!book) {
      // Rollback: Delete newly created rating
      await Rating.findByIdAndDelete(newRating._id);
      return res.status(404).json({ message: "Book not found." });
    }

    // Debugging log
    console.log('Book:', book);

    // Check if authorId is present in book
    if (!book.authorId) {
      // Rollback: Delete newly created rating
      await Rating.findByIdAndDelete(newRating._id);
      return res.status(400).json({ message: "Author ID is required for the book." });
    }

    book.ratings.push(newRating._id);
    book.ratingCount = book.ratings.length;

    // Calculate average rating
    const ratings = await Rating.find({ book: bookId });
    const totalRating = ratings.reduce((acc, ratingDoc) => acc + ratingDoc.rating, 0);
    book.averageRating = totalRating / book.ratingCount;
    
    await book.save();
    console.log('dfdf')
    // Send notification to the author of the book
    await createNotification(userId, book.authorId._id, "rating", "Someone rated your book");

    res.status(200).json({ message: "Rating added successfully", data: newRating });
  } catch (err) {
    // Handle any errors and respond with an error message
    if (err.name === "ValidationError") {
      // Mongoose validation error
      const errors = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: errors });
    }
    res.status(500).json({ message: err.message });
  }
};

module.exports={
  addRating
}