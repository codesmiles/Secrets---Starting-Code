//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
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
app.use(
    session({
      secret: "Its a secret.",
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
app.use(passport.session());

// setting up mongoose
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true });

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

userSchema.plugin(passportLocalMongoose); // passport local mongoose

const User = mongoose.model("User", userSchema);

////////////////PASSPORT////////////////////
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
///////////////////////////////////////////////

////////////Home Page////////////
app.get("/", function (req, res) {
    res.render("home");
  });
  
  ///////////////SECRETS PAGE///////////////
  app.get(`/secrets`, (req, res) => {
    if (req.isAuthenticated()) {
      res.render("secrets");
    } else {
      res.redirect("/login");
    }
  });
  
  ///////////register page////////////
  app
    .route("/register")
    .get(function (req, res) {
      res.render("register");
    })
    .post(function (req, res) {
      ////////////////PASSPORT LOCAL MONGOOSE/////////
      User.register(
        { username: req.body.username },
        req.body.password,
        (err, user) => {
          if (err) {
            console.log(err);
            res.redirect("/register");
          } else {
            passport.authenticate("local")(req, res, () => {
              res.redirect("/secrets");
            });
          }
        }
      );
    })
    

    const port = process.env.PORT || 4000;

    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
    