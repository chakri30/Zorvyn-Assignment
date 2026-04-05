const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

const { generalLimiter } = require('./src/middleware/rateLimiter');
app.use(generalLimiter);
app.use('/api/auth', authLimiter, require('./src/routes/authRoutes'));

// Test route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Finance Backend API',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/records', require('./src/routes/recordRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Export app for testing (don't start server here)
module.exports = { app };

// Only start server if this file is run directly (not imported)
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}