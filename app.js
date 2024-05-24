const express = require("express");
const mongoose= require('mongoose');
const userRoutes=require('./routes/userRoutes')
const cors=require('cors');
const dotenv=require('dotenv').config();
// const nodemailer = require('nodemailer')
const app = express();
app.use(express.json());
app.use(cors())
app.use(express.urlencoded( { extended: false } ));  
mongoose.connect(process.env.CONNECTION_DB).then(()=>console.log("connected to db 😃"))
.catch((err)=>console.error(err));
app.use('/users',userRoutes)

// const transporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'telly.roob52@ethereal.email',
//         pass: 'bmDwfHan88VM8sWj57'
//     }
// });

// var mailOptions = {
//   from: 'angloesam61@gmail.com',
//   to: 'abdelrhmansholkamy1999@gmail.com',
//   subject: 'Sending Email using Node.js',
//   text: 'That was easy!'
// };

// transporter.sendMail(mailOptions, function(error, info){
//   if (error) {
//     console.log(error);
//   } else {
//     console.log('Email sent: ' + info.response);
//   }
// });
app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`))