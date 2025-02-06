require("dotenv").config();
const express = require("express");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const TwitterStrategy = require("passport-twitter").Strategy;

const app = express();

// CORS setup
app.use(cors());

// Session setup
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

// Passport setup
app.use(passport.initialize());
app.use(passport.session());

// Define multiple callback URLs
const callbackURL =
  process.env.NODE_ENV === "production"
    ? "https://x-auth-production.up.railway.app/auth/twitter/callback"
    : "http://localhost:3000/auth/twitter/callback";

// Passport Twitter Strategy configuration
passport.use(
  new TwitterStrategy(
    {
      consumerKey: process.env.TWITTER_CONSUMER_KEY,
      consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
      callbackURL: callbackURL,
    },
    function (token, tokenSecret, profile, done) {
      // Here you can save the user profile to your database
      return done(null, profile);
    }
  )
);

// Serialize user
passport.serializeUser(function (user, done) {
  done(null, user);
});

// Deserialize user
passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

// Routes
app.get("/", (req, res) => {
  res.send('<a href="/auth/twitter">Login with Twitter</a>');
});

app.get("/auth/twitter", passport.authenticate("twitter"));

app.get(
  "/auth/twitter/callback",
  passport.authenticate("twitter", { failureRedirect: "/" }),
  function (req, res) {
    // Successful authentication, redirect home.
    res.redirect("/");
  }
);

app.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
