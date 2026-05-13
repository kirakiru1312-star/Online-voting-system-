const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const partyRoutes = require('./routes/partyRoutes');
const electionRoutes = require('./routes/electionRoutes');
const candidateRoutes = require('./routes/candidateRoutes');
const voteRoutes = require('./routes/voteRoutes');
const resultRoutes = require('./routes/resultRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');

const app = express();

const path = require('path');

// Middleware
const allowedOrigins = [
  'https://online-voting-system-3bwp.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/parties', partyRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);

// Health check
app.get('/', (req, res) => res.json({ message: 'Online Voting System API is running' }));

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ message: err.message || 'Internal Server Error' });
});

// Connect to MongoDB and start server
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
