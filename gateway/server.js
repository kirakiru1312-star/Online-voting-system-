/**
 * API Gateway – Port 5000
 *
 * Single entry point for the frontend. Routes all /api/* requests to the
 * correct microservice. The frontend's REACT_APP_API_URL stays unchanged.
 *
 * Routing table:
 *   /api/auth/*              → auth-service   (port 5001)
 *   /api/admin/stats         → auth-service   (port 5001)
 *   /api/admin/voters        → auth-service   (port 5001)
 *   /api/admin/audit-logs    → auth-service   (port 5001)
 *   /api/admin/tally         → voting-service (port 5003)
 *   /api/admin/logs          → voting-service (port 5003)
 *   /api/votes/*             → voting-service (port 5003)
 *   /api/results/*           → voting-service (port 5003)
 *   /api/parties/vote        → voting-service (port 5003)
 *   /api/candidates/vote     → voting-service (port 5003)
 *   /api/elections/*         → election-service (port 5002)
 *   /api/parties/*           → election-service (port 5002)
 *   /api/candidates/*        → election-service (port 5002)
 *   /api/contact/*           → election-service (port 5002)
 *   /uploads/*               → election-service (port 5002)  [static files]
 */

const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

const allowedOrigins = [
  'https://online-voting-system-3bwp.vercel.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) callback(null, true);
    else callback(new Error(`CORS policy: origin ${origin} not allowed`));
  },
  credentials: true
}));

const AUTH    = process.env.AUTH_SERVICE_URL    || 'http://localhost:5001';
const ELECTION = process.env.ELECTION_SERVICE_URL || 'http://localhost:5002';
const VOTING  = process.env.VOTING_SERVICE_URL  || 'http://localhost:5003';

const proxy = (target) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error(`[gateway] Proxy error → ${target}:`, err.message);
        res.status(502).json({ message: `Service unavailable: ${err.message}` });
      }
    }
  });

// ── Auth Service routes ────────────────────────────────────
app.use('/api/auth', proxy(AUTH));

// Admin routes that live in auth-service
app.use('/api/admin/stats',       proxy(AUTH));
app.use('/api/admin/voters',      proxy(AUTH));
app.use('/api/admin/audit-logs',  proxy(AUTH));

// Admin routes that live in voting-service
app.use('/api/admin/tally',  proxy(VOTING));
app.use('/api/admin/logs',   proxy(VOTING));

// ── Voting Service routes ──────────────────────────────────
// Vote-casting sub-routes MUST come before the general party/candidate routes
app.use('/api/parties/vote',    proxy(VOTING));
app.use('/api/candidates/vote', proxy(VOTING));
app.use('/api/votes',           proxy(VOTING));
app.use('/api/results',         proxy(VOTING));

// ── Election Service routes ────────────────────────────────
app.use('/api/elections',  proxy(ELECTION));
app.use('/api/parties',    proxy(ELECTION));
app.use('/api/candidates', proxy(ELECTION));
app.use('/api/contact',    proxy(ELECTION));

// Static uploads served by election-service
app.use('/uploads', proxy(ELECTION));

// Health check
app.get('/', (req, res) =>
  res.json({
    service: 'api-gateway',
    status: 'running',
    port: process.env.PORT,
    services: { auth: AUTH, election: ELECTION, voting: VOTING }
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[api-gateway] Running on port ${PORT}`);
  console.log(`  → auth-service    : ${AUTH}`);
  console.log(`  → election-service: ${ELECTION}`);
  console.log(`  → voting-service  : ${VOTING}`);
});
