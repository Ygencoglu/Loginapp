// routes/mainRoutes.js
const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const isLoggedIn = require('../middlewares/authMiddleware');
const User = require('../models/User');
const { pool } = require('../utils/dbUtils');
const flash = require('connect-flash'); // Eğer flash mesajları kullanıyorsanız
// Ana sayfa
router.get('/', (req, res) => {
    res.render('index', { message: req.flash('error') });
});

// Kayıt sayfası
router.get('/register', (req, res) => {
    res.render('register', { message: req.flash('error') });
});

// Kayıt işlemi
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
// Dashboard
router.get('/dashboard', isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;
    const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);
    if (existingDetail.rows.length > 0) {
      res.render('dashboard', { user: req.user, existingDetail: existingDetail.rows[0] });
    } else {
      res.render('dashboard', { user: req.user });
    }
  } catch (err) {
    console.error(err);
    res.render('dashboard', { user: req.user, error: 'An error occurred while fetching user details.' });
  }
});
module.exports = router;
