const amqp = require('amqplib');

async function setupRabbitMQ() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    console.log('Connected to RabbitMQ successfully');
    
    const channel = await connection.createChannel();
    console.log('RabbitMQ channel created successfully');
    
    return channel;
  } catch (error) {
    console.error('RabbitMQ connection/channel error:', error);
    throw error;
  }
}

module.exports = { setupRabbitMQ };
