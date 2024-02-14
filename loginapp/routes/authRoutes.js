//routes/authRoutes.js
const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const router = express.Router();

router.get('/login', (req, res) => {
    es.render('login', { message: req.flash('error') }); 
});

router.post('/login', passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/',
    failureFlash: true,
}));

router.get('/register', (req, res) => {
    res.render('register', { message: req.flash('error') });
});

router.post('/register', async (req, res) => {
    const { username, password, confirmPassword } = req.body;
    // Şifre doğrulaması kontrolü
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match');
      return res.redirect('/register');
    }
    try {
      // Hash the password
      const hash = await bcrypt.hash(password, 10);
  
      // Create a new user
      const newUser = new User({ username, password: hash });
  
      // Save the user to the database
      await newUser.save();
  
      res.redirect('/');
    } catch (err) {
      console.error(err);
      req.flash('error', 'User already exists or an error occurred during registration');
      res.redirect('/register');
    }
});

module.exports = router;
