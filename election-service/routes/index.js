const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { protect, authorize, softProtect } = require('../middleware/authMiddleware');

const electionCtrl = require('../controllers/electionController');
const partyCtrl = require('../controllers/partyController');
const candidateCtrl = require('../controllers/candidateController');
const contactCtrl = require('../controllers/contactController');

// ── Elections ──────────────────────────────────────────────
router.get('/elections', electionCtrl.getElections);
router.get('/elections/:id', electionCtrl.getElection);
router.post('/elections', protect, authorize('admin'), electionCtrl.createElection);
router.put('/elections/:id', protect, authorize('admin'), electionCtrl.updateElection);
router.delete('/elections/:id', protect, authorize('admin'), electionCtrl.deleteElection);

// ── Parties ────────────────────────────────────────────────
router.get('/parties', partyCtrl.getParties);
router.get('/parties/:id', partyCtrl.getParty);
router.post('/parties', protect, authorize('admin'), upload.single('logo'), partyCtrl.createParty);
router.put('/parties/:id', protect, authorize('admin'), upload.single('logo'), partyCtrl.updateParty);
router.delete('/parties/:id', protect, authorize('admin'), partyCtrl.deleteParty);

// ── Candidates ─────────────────────────────────────────────
router.get('/candidates', candidateCtrl.getCandidates);
router.get('/candidates/:id', candidateCtrl.getCandidate);
router.post('/candidates', protect, authorize('admin'), upload.single('photo'), candidateCtrl.createCandidate);
router.put('/candidates/:id', protect, authorize('admin'), upload.single('photo'), candidateCtrl.updateCandidate);
router.delete('/candidates/:id', protect, authorize('admin'), candidateCtrl.deleteCandidate);

// ── Contact ────────────────────────────────────────────────
router.post('/contact', softProtect, contactCtrl.submitMessage);
router.get('/contact/admin', protect, authorize('admin'), contactCtrl.getMessages);
router.get('/contact/admin/stats', protect, authorize('admin'), contactCtrl.getMessageStats);
router.put('/contact/admin/:id/read', protect, authorize('admin'), contactCtrl.markAsRead);
router.delete('/contact/admin/:id', protect, authorize('admin'), contactCtrl.deleteMessage);
router.post('/contact/admin/reply', protect, authorize('admin'), contactCtrl.replyToMessage);

module.exports = router;
