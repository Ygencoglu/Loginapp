const express = require('express');
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const flash = require('connect-flash');
const { setupRabbitMQ } = require('./utils/rabbitMQUtils');
const { setupRedis } = require('./utils/redisUtils');
const { connectMongoDB, connectPostgreSQL } = require('./utils/dbUtils');
const mongoose = require('mongoose');
const app = express();
const ObjectId = mongoose.Types.ObjectId;
const isLoggedIn = require('./middlewares/authMiddleware');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const mainRoutes = require('./routes/mainRoutes');
const chatRoutes = require('./routes/chatRoutes');  
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const Chat = require('./models/Chat');
app.use(express.static('public'));
// RabbitMQ setup
const rabbitMQChannel = setupRabbitMQ();
// Redis setup
const redisClient = setupRedis();
// MongoDB and PostgreSQL setup
connectMongoDB();
connectPostgreSQL();
const User = require('./models/User');
const RedisStore = require('connect-redis');
app.use(session({
  secret: 'aaa',
  saveUninitialized: false,
  resave: false,
  cookie: {
    secure: false, // HTTPS kullanıyorsanız true yapın
    httpOnly: true,
    maxAge: 1000 * 60 * 60 * 24 // Örneğin 1 gün için
  }
}));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: 'Incorrect username.' });
      }

      const passwordMatch = await bcrypt.compare(password, user.password);
      if (passwordMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Incorrect password.' });
      }
    } catch (err) {
      return done(err);
    }
  }
));
passport.serializeUser((user, done) => {
  done(null, user.id);
});
passport.deserializeUser((id, done) => {
  User.findById(id)
    .then(user => done(null, user))
    .catch(err => done(err));
});
// RabbitMQ kullanarak mesaj gönderme fonksiyonu
function sendToQueue(queue, message) {
  rabbitMQChannel.assertQueue(queue, {
    durable: false
  });
  rabbitMQChannel.sendToBuffer(queue, Buffer.from(message));
}

io.on('connection', (socket) => {
  socket.on('join', (userId) => {
    socket.join(userId);
  });

  socket.on('private message', async (message) => {
    socket.to(message.to).emit('private message', message);
    await new Chat({
        from: message.from,
        to: message.to,
        message: message.text
    }).save();
});
});

// Routes
app.use(mainRoutes);
app.use(authRoutes);
app.use(userRoutes);
app.use(chatRoutes);
// Server
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
