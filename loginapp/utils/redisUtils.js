const redis = require('redis');

function setupRedis() {
  // Redis Client oluşturma (redis'in yeni sürümü için)
  const redisClient = redis.createClient({
    url: 'redis://localhost:6379', // Redis URL'si
    // password: 'your_redis_password', // Eğer Redis şifre korumalıysa
  });

  redisClient.connect().catch(console.error);

  redisClient.on('error', function(err) {
    console.log('Could not establish a connection with Redis. ' + err);
  });

  redisClient.on('connect', function(err) {
    console.log('Connected to Redis successfully');
  });

  return redisClient;
}

module.exports = { setupRedis };
