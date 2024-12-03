// Load environment variables from a .env file into process.env
require('dotenv').config();

// Import required modules
const express = require('express'); // Web framework for building the server
const session = require('express-session'); // Middleware for managing sessions
const passport = require('passport'); // Authentication middleware
const GoogleStrategy = require('passport-google-oauth20').Strategy; // Google OAuth 2.0 strategy for authentication

// Create an Express application
const app = express();

// Configure session middleware
app.use(session({
    secret: process.env.SESSION_SECRET, // Used to sign the session ID cookie; replace with a secure value in production
    resave: false, // Prevents session from being saved back to the store unless modified
    saveUninitialized: true, // Save new sessions even if they're not modified
}));

// Initialize Passport.js middleware
app.use(passport.initialize()); // Initializes Passport for authentication
app.use(passport.session()); // Integrates Passport with session middleware for persistent login sessions

// Configure the Google OAuth 2.0 strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID, // Your Google client ID from the Google Developer Console
    clientSecret: process.env.GOOGLE_CLIENT_SECRET, // Your Google client secret
    callbackURL: '/auth/google/callback' // URL to handle callback from Google after authentication
  },
  function(accessToken, refreshToken, profile, done) {
    // Callback function after Google authenticates the user
    // Here, you can save the user profile to your database if needed
    return done(null, profile); // Pass the profile object to the next middleware
  }
));

// Serialize user into the session
passport.serializeUser((user, done) => {
    done(null, user); // Save the entire user object into the session
});

// Deserialize user from the session
passport.deserializeUser((user, done) => {
    done(null, user); // Retrieve the user object from the session
});

// Define the home route
app.get('/', (req, res) => {
    res.send('<h1>Home</h1><a href="/auth/google">Login with Google</a>');
    // Displays a link to start the Google login process
});

// Define the route to start the Google OAuth flow
app.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
    // Request access to the user's Google profile and email
);

// Define the callback route after Google authentication
app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/' }), // Redirect to home on failure
    (req, res) => {
      res.redirect('/profile'); // Redirect to profile page on successful login
    }
);

// Define the profile route
app.get('/profile', (req, res) => {
    res.send(`<h1>Profile</h1><pre>${JSON.stringify(req.user, null, 2)}</pre>`);
    // Displays the logged-in user's profile information
});

// Start the server
app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
    // Logs the server URL in the console
});



//Step-by-step procedure
// https://github.com/Ankur77720/Difference-Backend-video/blob/main/025-googleoauth/readme.md