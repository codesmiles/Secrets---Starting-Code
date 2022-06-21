//jshint esversion:6
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const _ = require("lodash");
const ejs = require("ejs");
const encrypt = require("mongoose-encryption"); //mongoose encryption package

const app = express();

// middleware
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// setting up mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });
const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});
// secret encryption key
const secret = "wahala";
userSchema.plugin(encrypt, { secret: secret, encryptedField: ["password"], }); //read more on mongoose encryption

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
      password: req.body.password,
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
    const username = req.body.username;
    const password = req.body.password;

    User.findOne({ email: username }, (err, foundUser) => {
      if (err) {
        console.log(err);
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

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
