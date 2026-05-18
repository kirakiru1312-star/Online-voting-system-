/**
 * Voting Service – DB: db_voting (MongoDB)
 * Port: 5003
 * Responsibilities: Vote casting, duplicate prevention, results, vote logs
 * Distributed role: High-concurrency write node – isolated vote data
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const routes = require('./routes/index');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());

app.use('/api', routes);

// Health check
app.get('/', (req, res) => res.json({ service: 'voting-service', status: 'running', port: process.env.PORT }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[voting-service]', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5003;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[voting-service] Connected to DB: db_voting');
    const server = app.listen(PORT, () => console.log(`[voting-service] Running on port ${PORT}`));
    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`[voting-service] ERROR: Port ${PORT} is already in use.`);
        console.error(`[voting-service] Run: taskkill /F /IM node.exe  then restart.`);
        process.exit(1);
      } else { throw err; }
    });
  })
  .catch((err) => {
    console.error('[voting-service] DB connection error:', err);
    process.exit(1);
  });
