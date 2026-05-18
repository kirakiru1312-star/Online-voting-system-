/**
 * Auth Service – DB: db_auth (MongoDB)
 * Port: 5001
 * Responsibilities: User registration, login, JWT, OTP, profile, audit logs, voter stats
 * Distributed role: Independent security node – isolated user data
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

// All auth + internal routes
app.use('/api/auth', authRoutes);

// Admin routes — gateway proxies /api/admin/stats → auth-service → /api/admin/stats
app.use('/api/admin', adminRoutes);

// Health check
app.get('/', (req, res) => res.json({ service: 'auth-service', status: 'running', port: process.env.PORT }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[auth-service]', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[auth-service] Connected to DB: db_auth');
    const server = app.listen(PORT, () => console.log(`[auth-service] Running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[auth-service] ERROR: Port ${PORT} is already in use.`);
        console.error(`[auth-service] Run: taskkill /F /IM node.exe  then restart.`);
        process.exit(1);
      } else {
        throw err;
      }
    });
  })
  .catch((err) => {
    console.error('[auth-service] DB connection error:', err);
    process.exit(1);
  });
