const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const yaml = require('js-yaml');
const { apiReference } = require('@scalar/express-api-reference');
const config = require('./config/config');
const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Import routes
const authRoutes = require('./routes/authRoutes');
const exampleRoutes = require('./routes/exampleRoutes');
const messageRoutes = require('./routes/messageRoutes');
const classificationRoutes = require('./routes/classificationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const pickupRoutes = require('./routes/pickupRoutes');
const guardianRoutes = require('./routes/guardianRoutes');
const studentRoutes = require('./routes/studentRoutes');
const classRoutes = require('./routes/classRoutes');
const emergencyPickupRoutes = require('./routes/emergencyPickupRoutes');

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
    timestamp: new Date().toISOString(),
    docs: `${req.protocol}://${req.get('host')}/api/docs`
  });
});

// API Routes
app.use(`${config.apiPrefix}/v1/auth`, authRoutes);
app.use(`${config.apiPrefix}/example`, exampleRoutes);
app.use(`${config.apiPrefix}/v1/messages`, messageRoutes);
app.use(`${config.apiPrefix}/v1/classifications`, classificationRoutes);
app.use(`${config.apiPrefix}/v1/notifications`, notificationRoutes);
app.use(`${config.apiPrefix}/v1/pickup-confirmations`, pickupRoutes);
app.use(`${config.apiPrefix}/v1/guardians`, guardianRoutes);
app.use(`${config.apiPrefix}/v1/students`, studentRoutes);
app.use(`${config.apiPrefix}/v1/classes`, classRoutes);
app.use(`${config.apiPrefix}/v1/emergency-pickups`, emergencyPickupRoutes);

// API Documentation with Scalar
const openapiPath = path.join(__dirname, '../docs/openapi.yaml');
const openapiSpec = yaml.load(fs.readFileSync(openapiPath, 'utf8'));

app.use(
  '/api/docs',
  apiReference({
    spec: {
      content: openapiSpec,
    },
  })
);

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
