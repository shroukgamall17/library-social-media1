const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true ,
    validate:[validator.isEmail,'Invalid Email'],lowercase:true
  },
    password: { type: String, required: true},
    photo:{type :String},
    followers: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.SchemaTypes.ObjectId, ref: 'User' }],
    confirmPassword: {type:String,required:true},
    role: { type: String, enum: ["admin", "user"], default: "user" },
    // resetPasswordToken: { type: String },
    // resetPasswordExpires: { type: Date }
},{
  timestamps:true
});


const userModel = mongoose.model("User", userSchema);
module.exports = userModel;
