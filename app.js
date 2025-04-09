const express = require('express');
const app = express();
const cookieParser= require("cookie-parser")
const path = require ("path")
const expressSession=require("express-session")
const flash=require("connect-flash")

require("dotenv").config()

const ownersRouter=require("./routes/ownersRouter")
const productsRouter=require("./routes/productsRouter")
const usersRouter=require("./routes/usersRouter")
const indexRouter = require('./routes/index');

const mongoose = require('mongoose')
const mongoURI = 'mongodb://127.0.0.1:27017/Scatchh';

app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(cookieParser())
app.use (
  expressSession({
    resave:false,
    saveUninitialized:false,
    secret:process.env.EXPRESS_SESSION_SECRET,
  })
)
app.use(flash())
app.use(express.static(path.join(__dirname,"public")))
app.set("view engine","ejs")

// Routers
app.use("/", indexRouter)
app.use("/owners", ownersRouter)
app.use("/users", usersRouter)
app.use("/products", productsRouter)

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
  .then(() => console.log('✅ MongoDB Connected Successfully!'))
  .catch(err => console.error('❌ MongoDB Connection Error:', err));

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
