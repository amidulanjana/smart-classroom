require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  apiPrefix: process.env.API_PREFIX || '/api',
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/aithon_classroom',
  jwtSecret: process.env.JWT_SECRET || 'fallback_secret_key',
  jwtExpire: process.env.JWT_EXPIRE || '30d',
  // Add more configuration as needed
};
