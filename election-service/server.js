/**
 * Election Service – DB: db_election (MongoDB)
 * Port: 5002
 * Responsibilities: Elections, Parties, Candidates, Contact Messages
 * Distributed role: Administrative control node – isolated election data
 */
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const routes = require('./routes/index');

const app = express();

app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
// Serve uploads from the shared backend/uploads folder (contains all existing images)
app.use('/uploads', express.static(path.join(__dirname, '..', 'backend', 'uploads')));
// Also serve from local uploads folder for any new uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// All election/party/candidate/contact routes under /api
app.use('/api', routes);

// Health check
app.get('/', (req, res) => res.json({ service: 'election-service', status: 'running', port: process.env.PORT }));

// Global error handler
app.use((err, req, res, next) => {
  console.error('[election-service]', err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

const PORT = process.env.PORT || 5002;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('[election-service] Connected to DB: db_election');
    app.listen(PORT, () => console.log(`[election-service] Running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('[election-service] DB connection error:', err);
    process.exit(1);
  });
