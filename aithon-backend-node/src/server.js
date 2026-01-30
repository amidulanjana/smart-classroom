const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const exampleRoutes = require('./routes/exampleRoutes');
const messageRoutes = require('./routes/messageRoutes');
const classificationRoutes = require('./routes/classificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const guardianRoutes = require('./routes/guardianRoutes');
const studentRoutes = require('./routes/studentRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Health check endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Aithon Backend Server is running',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use(`${config.apiPrefix}/example`, exampleRoutes);
app.use(`${config.apiPrefix}/v1/messages`, messageRoutes);
app.use(`${config.apiPrefix}/v1/classifications`, classificationRoutes);
app.use(`${config.apiPrefix}/v1/notifications`, notificationRoutes);
app.use(`${config.apiPrefix}/v1/pickup-confirmations`, pickupRoutes);
app.use(`${config.apiPrefix}/v1/guardians`, guardianRoutes);
app.use(`${config.apiPrefix}/v1/students`, studentRoutes);

// Error handling middleware (should be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${config.nodeEnv}`);
  console.log(`API Prefix: ${config.apiPrefix}`);
});

module.exports = app;
