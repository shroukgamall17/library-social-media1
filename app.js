const express = require("express");
const mongoose= require('mongoose');
const userRoutes=require('./routes/userRoutes')
const cors=require('cors');
const dotenv=require('dotenv').config();
const app = express();
app.use(express.json());
app.use(cors())
app.use(express.urlencoded( { extended: false } ));  
mongoose.connect(process.env.CONNECTION_DB).then(()=>console.log("connected to db 😃"))
.catch((err)=>console.error(err));
app.use('/users',userRoutes)
app.listen(process.env.PORT, () => console.log(`Example app listening on port ${process.env.PORT}!`))