const mongoose = require('mongoose');
const { Pool } = require('pg');

function connectMongoDB() {
  mongoose.connect('mongodb://localhost:27017/kullaniciDB');
  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'MongoDB connection error:'));
}

function connectPostgreSQL() {
  const pool = new Pool({
    user: 'yusuf',
    host: 'localhost',
    database: 'kullaniciDetayDB',
    password: '123',
    port: 5432,
  });

  // Dışa aktarılan pool değişkeni
  module.exports.pool = pool;

  return pool;
}

module.exports = { connectMongoDB, connectPostgreSQL };
