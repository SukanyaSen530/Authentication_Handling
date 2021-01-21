require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
//const encrypt = require('mongoose-encryption');
const app = express();
const md5 = require("md5");

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));

mongoose.connect('mongodb://localhost:27017/userDB', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const userSchema = new mongoose.Schema({
  email: String,
  password: String
});

//userSchema.plugin(encrypt, { secret: process.env.SECRET , encryptedFields: ['password']});

const User = new mongoose.model("User", userSchema);

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get("/", (req, res) => {
  res.render("home");
})

app.route("/register")
  .get((req, res) => {
    res.render("register");
  })
  .post((req, res) => {
    const newUser = new User({
      email: req.body.username,
      password: md5(req.body.password)
    })
    newUser.save((err) => {
      if (!err) {
        res.render("secrets");
      } else {
        res.send(err);
      }
    });
  });

app.route('/login')
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const username = req.body.username;
    const password= md5(req.body.password);
    User.findOne({email:username}, (err, foundUser) => {
      if (err) {
        res.send(err);
      } else {
        if (foundUser) {
          if(foundUser.password === password){
             res.render("secrets");
           }
        }
      }
    });
  });

app.listen(3000, function() {
  console.log("Server started on port 3000");
})
