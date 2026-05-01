const express = require('express');
const router = express.Router();
const { getResults } = require('../controllers/resultController');
const { protect } = require('../middleware/authMiddleware');

router.get('/:electionId', protect, getResults);

module.exports = router;
