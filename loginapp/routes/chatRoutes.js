const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/authMiddleware');
const User = require('../models/User');
const Chat = require('../models/Chat');

router.get('/chat', isLoggedIn, async (req, res) => {
    const users = await User.find({ _id: { $ne: req.user.id } });
    res.render('chat', { users: users, currentUser: req.user });
});
router.get('/chat/:id', isLoggedIn, async (req, res) => {
    const messages = await Chat.find({
        $or: [{ from: req.params.id, to: req.user.id }, { from: req.user.id, to: req.params.id }]
    }).populate('from to');

    res.json(messages);
});


module.exports = router;
