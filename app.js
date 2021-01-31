require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
const app = express();
const session = require('express-session');
const passport= require('passport');
const passportLocalMongoose=require('passport-local-mongoose');
// const bcrypt = require('bcrypt');
// const saltRounds = 12;
//const encrypt = require('mongoose-encryption');
//const md5 = require("md5");

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
mongoose.set("useCreateIndex", true); //for depreciation
app.use(session({                                   // using passport for setting up session
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: false,
}));
app.use(passport.initialize()); //for authentication
app.use(passport.session()); // set up session

/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

userSchema.plugin(passportLocalMongoose); //hash and salt password and save users in db
//userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser()); //creates cookie
passport.deserializeUser(User.deserializeUser()); //breaks cookie to know the information of user info

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.render("home");
})

app.route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    User.register({username:req.body.username, active: false}, req.body.password, function(err, registeredUser) {
    if (err) { console.log(err); res.redirect("/register"); }
    else{
      passport.authenticate("local")(req, res, function(){
        res.redirect("/secrets");
      })
    }
  });
  });

app.route('/login')
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const user=new User({
      username: req.body.username,
      password: req.body.password
    });
    req.login(user, function(err){
      if(err){console.log(err);}
      else{
        passport.authenticate("local")(req, res, function(){
          res.redirect("/secrets");})
        }
});
});

  app.route("/secrets")
  .get((req, res)=>{
    if(req.isAuthenticated()){
      res.render("secrets");
    }
    else{
      res.redirect("/login");
    }
  });

  app.get("/logout", (req, res)=>{
    req.logout();
    res.redirect("/");
  })

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
