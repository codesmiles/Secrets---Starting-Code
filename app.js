//jshint esversion:6
require("dotenv").config()
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const _ = require("lodash");
const ejs = require("ejs");
// const encrypt = require("mongoose-encryption"); //mongoose encryption package
const md5 = require("md5");

const app = express();

// middleware
// app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

// setting up mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
// secret encryption key

//  userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedField: ["password"] }); //read more on mongoose encryption

const User = mongoose.model("User", userSchema);

////////////Home Page////////////
app.get("/", function (req, res) {
  res.render("home");
});

///////////register page////////////
app
  .route("/register")
  .get(function (req, res) {
    res.render("register");
  })
  .post(function (req, res) {
    const newUser = new User({
      email: req.body.username,
      password:req.body.password
    //   password: md5(req.body.password),
    });
    newUser.save((err) => {
      if (!err) {
        res.render("secrets");
      } else {
        console.log(err);
      }
    });
  });

//////////login page////////////
app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const email = req.body.username;
    const password = md5(req.body.password);
    // const password = req.body.password;

    console.log(email,password)
    

    User.findOne({ email }, (err, foundUser) => {
      if (err) {
      } else {
        if (foundUser) {
          if (foundUser.password === password) {
            res.render("secrets");
          }
        }
      }
    });
  });

//////////SUBMIT page////////////
app.get("/submit", function (req, res) {
  res.render("submit");
});


// User.findOne({email:`mikedbchi@yahoo.com`},(err,data)=>{
//     console.log(data)
//     })

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
