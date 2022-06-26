//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const session = require("express-session"); //level 4
const passport = require("passport"); //level 4
const passportLocalMongoose = require("passport-local-mongoose"); //level 4
const GoogleStrategy = require("passport-google-oauth20").Strategy; //level 6
const findOrCreate = require("mongoose-findorcreate");
const passportFacebook = require("passport-facebook"); //require facebook

// looking into passportjs.org is keen

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
  googleId:String
});

userSchema.plugin(passportLocalMongoose); // passport local mongoose
userSchema.plugin(findOrCreate);
const User = mongoose.model("User", userSchema);

////////////////PASSPORT////////////////////
passport.use(User.createStrategy());

// passport.serializeUser(User.serializeUser()); //passport local mongoose
// passport.deserializeUser(User.deserializeUser()); //passport local mongoose

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
///////////////////////////////////////////////

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:4000/auth/google/secrets",
    },
    (accessToken, refreshToken, profile, cb) => {
      console.log(profile);
      // console.log(accessToken);
      // console.log(refreshToken);
      User.findOrCreate({ googleId: profile.id }, function (err, user) {
        return cb(err, user);
      });
    }
  )
);

////////////Home Page////////////
app.get("/", function (req, res) {
  res.render("home");
});

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile"] })
);

app.get(
  "/auth/google/secrets",
  passport.authenticate("google", { failureRedirect: "/login" }),
  function (req, res) {
    // Successful authentication, redirect to secrets.
    res.redirect("/secrets");
  }
);

///////////////SECRETS PAGE///////////////
app.get(`/secrets`, (req, res) => {
  if (req.isAuthenticated()) {
    res.render("secrets");
  } else {
    res.redirect("/login");
  }
});

app.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      console.log(err);
    }
  });
  res.redirect("/");
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
  });

 //////////LOGIN////////////////
app
  .route("/login")
  .get((req, res) => {
    res.render("login");
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    /////////PASSPORT////////////
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate("local")(req, res, () => {
          res.redirect("/secrets");
        });
      }
    });
  });
const port = process.env.PORT || 4000;

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
