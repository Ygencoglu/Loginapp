const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/authMiddleware');
const User = require('../models/User');
const pool = require('../utils/dbUtils').connectPostgreSQL();
const bcrypt = require('bcryptjs');


router.get('/user-list', isLoggedIn, async (req, res) => {
    try {
    // MongoDB'den tüm kullanıcıları çek
    const users = await User.find({});
    // user-list.ejs template'ini kullanıcılarla render et
    res.render('user-list', { users: users });
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});


router.get('/add-details', isLoggedIn, async (req, res) => {
    try {
        // PostgreSQL'den kullanıcının mevcut detayını kontrol et
        const userId = req.user._id;
        const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);
    
        // Mevcut detay varsa, detayları göster
        if (existingDetail.rows.length > 0) {
          res.render('add-details', { existingDetail: existingDetail.rows[0] });
        } else {
          res.render('add-details');
        }
      } catch (err) {
        console.error(err);
        res.render('add-details', { error: 'An error occurred while fetching user details.' });
      }
});

router.post('/add-details', isLoggedIn, async (req, res) => {
    const { username, city, birthdate } = req.body;

  try {
    const user = await User.findOne({ username: username });
    if (!user) {
      return res.render('add-details', { error: 'User not found.' });
    }

    const userId = user._id;

    const existingDetail = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [userId]);

    if (existingDetail.rows.length > 0) {
      // Mevcut detay varsa, detayları güncelle
      await pool.query('UPDATE user_details SET city = $1, birthdate = $2 WHERE user_id = $3', [city, birthdate, userId]);
    } else {
      // Mevcut detay yoksa, detayları ekle
      await pool.query('INSERT INTO user_details (user_id, city, birthdate) VALUES ($1, $2, $3)', [userId, city, birthdate]);
    }

    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('add-details', { error: 'An error occurred while adding user details.' });
  }
});

router.get('/delete-user', isLoggedIn, (req, res) => {
    res.render('delete-user');
});

router.post('/delete-user', isLoggedIn, async (req, res) => {
    try {
        const username = req.body.username;
    
        const user = await User.findOne({ username: username });
        if (!user) {
          return res.status(404).send('Kullanıcı bulunamadı');
        }
        const userId = user._id;
        await pool.query('DELETE FROM user_details WHERE user_id = $1', [userId.toString()]);
        await User.deleteOne({ _id: userId });
        res.redirect('/search');
      } catch (error) {
        console.error(error);
        res.status(500).send('Bir hata oluştu');
      }
});

router.get('/live-search', isLoggedIn, async (req, res) => {
    const query = req.query.query;

  try {
    const users = await User.find({ username: { $regex: query, $options: 'i' } }, 'username _id');

    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'An error occurred during live search.' });
  }
});


router.get('/search', isLoggedIn, (req, res) => {
    res.render('search');
});

router.post('/search', isLoggedIn, async (req, res) => {
    const searchedUsername = req.body.searchedUsername;

  try {
    const user = await User.findOne({ username: searchedUsername });

    if (!user) {
      res.render('search', { error: 'User not found.' });
    } else {
      // PostgreSQL'den kullanıcının detaylarını çek
      const result = await pool.query('SELECT * FROM user_details WHERE user_id = $1', [user._id]);
      res.render('search', { user: user, details: result.rows });
    }
  } catch (err) {
    console.error(err);
    res.render('search', { error: 'An error occurred while searching for the user.' });
  }
});

router.get('/add-user', isLoggedIn, (req, res) => {
    res.render('add-user');
  });

router.post('/add-user', isLoggedIn, async (req, res) => {
  const { username, password, city, birthdate } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
    const userId = newUser._id;
    await pool.query('INSERT INTO user_details (user_id, city, birthdate) VALUES ($1, $2, $3)', [userId, city, birthdate]);


    res.redirect('/search');
  } catch (err) {
    console.error(err);
    res.render('add-user', { error: 'An error occurred while adding the user.' });
  }
});
module.exports = router;
