const express=require('express');
const multer = require("multer");
const path = require("path");
const fs =require('fs');
const{getAllBook,addBook,searchByCategory, updateBook, deleteBook, getSingleBook}=require('../controllers/bookController')
// Define multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../bookImage/');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString().replace(/:/g, '-') + file.originalname);
  }
});

const upload = multer({ storage: storage });
const router = express.Router();
// Get All Book
router.get('/',getAllBook);
//search for book
router.get('/search',searchByCategory);

//Add book
router.post('/',upload.single('pdf'),addBook);
//Update book
router.patch('/:id',updateBook);
//delete book
router.delete('/:id',deleteBook);
//getSingle Book
router.get('/single/:id',getSingleBook);

module.exports = router;