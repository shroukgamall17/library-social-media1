const bookModel = require("../models/bookModel");
// func GetAllBook
const getAllBook = async (req, res) => {
  try {
    const books = await bookModel.find({});
    res.status(200).json({ message: "success", Data: books });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//add book
const addBook = async (req, res) => {
  try {
    // Check if req.file exists before accessing its properties
    const files = req.file; 
      let Pdf = '';
  
    
      if (files) {
        Pdf = files.filename;
      }

    const { title, description, category } = req.body;

    // Check if required fields are missing
    if (!title || !description || !category) {
      return res.status(400).json({ message: "Title, description, and category are required fields." });
    }

    const newBook = await bookModel.create({
      title,
      description,
      category,
      Pdf
    });

    res.status(200).json({ message: "Added successfully", data: newBook });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

//func update
const updateBook = async (req, res) => {
  try {
    const { id } = req.params;
    const { title,description } = req.body;
    const newBook = await bookModel.findByIdAndUpdate(
      id,
      { title,description },
      { new: true }
    );
    if (!newBook)
      return res.status(404).json({ message: "not find book with id" });
    else {
      res.status(200).json({ message: "updata sucess", data: newBook });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
//func dele
const deleteBook = async (req, res) => {
    try {
        const { id } = req.params;
        const delBook = await bookModel.findByIdAndDelete(id);
        if (!delBook) {
            return res.status(404).json({ message: 'Book not found with id' });
        }
        
        res.json({ message: 'Deleted successfully' });
        
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

//func getsingle book
const getSingleBook=async(req,res)=>{
    try{
        const{id}=req.params;
        const singleBook=await bookModel.findById(id);
        res.status(200).json({message:'get success',data:singleBook})

    }catch (err) {
        res.status(500).json({ message: err.message });
      }
}
const searchByCategory=async(req,res)=>{
  try {
    const{category}=req.query;
  const findBook=await bookModel.find({category});
  res.status(200).json(findBook)
  } catch (error) {
   return res.status(500).json({ message: error.message });
  }
}

module.exports = { getAllBook, searchByCategory,
  addBook, updateBook ,deleteBook,getSingleBook};
