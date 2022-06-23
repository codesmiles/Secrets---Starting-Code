//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
// const encrypt = require("mongoose-encryption"); //mongoose encryption package level1
// const md5 = require("md5");level 2
// const bcrypt = require("bcrypt");level 3  
const session = require("express-session"); //level 4
const passport = require("passport"); //level 4
const passportLocalMongoose = require("passport-local-mongoose"); //level 4

const app = express();

// middleware
app.use(express.json());
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

///////////////////////EXPRESS SESSION in middleware///////////////////////
app.use(session({
  secret:"Its a secret.",
  resave:false,
  saveUninitialized:false
}))

app.use(passport.initialize())
app.use(passport.session())

// setting up mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

// secret encryption key(Mongoose-encryption)
//  userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedField: ["password"] }); //read more on mongoose encryption

userSchema.plugin(passportLocalMongoose); // passport local mongoose

const User = mongoose.model("User", userSchema);

passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


/////////////////bcrypt//////////////////
// //const saltRounds = 10;
// const salt = bcrypt.genSalt(saltRounds)

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
    ////////////////BCRYPT//////////////
    // bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
    //   const newUser = new User({
    //     email: req.body.username,
    //     password: hash,
    //     //   password: md5(req.body.password), //md5
    //   });
    //   newUser.save((err) => {
    //     if (!err) {
    //       res.render("secrets");
    //     } else {
    //       console.log(err);
    //     }
    //   });
    // });

    // //////////////////////


  });

//////////login page////////////
app
  .route("/login")
  .get(function (req, res) {
    res.render("login");
  })
  .post(function (req, res) {
    const email = req.body.username;
    const password = req.body.password;
    // const password = md5(req.body.password); //md5

    // console.log(email,password)

    User.findOne({ email }, (err, foundUser) => {
      if (err) {
      } else {
        if (foundUser) {
          ////////////BCRYPT////////////
          bcrypt.compare(password, foundUser.password, (err, result) => {
            if(err){console.log(err)}
            if (result) {
              res.render("secrets");
            }else{console.log(`invalid passward`)}
          });
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
