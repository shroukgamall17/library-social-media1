const mongoose=require('mongoose');
const bookSchema=new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    description:{type:String},
    category:{type:String},
    Pdf:{type:String}
},{timestamps:true});
const bookModel=mongoose.model('Book',bookSchema);
module.exports=bookModel;