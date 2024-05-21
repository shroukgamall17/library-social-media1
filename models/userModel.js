const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true ,
    validate:[validator.isEmail,'Invalid Email'],lowercase:true
  },
    password: { type: String, required: true},
    confirmPassword: {type:String,required:true},
    role: { type: String, enum: ["admin", "user"], default: "user" }
},{
  timestamps:true
});


const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
