const { body } = require('express-validator');
const Election = require('../models/Election');
const validate = require('../middleware/validate');

// @desc  Get all elections
// @route GET /api/elections
exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find().populate('createdBy', 'name email');
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Get single election
// @route GET /api/elections/:id
exports.getElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('createdBy', 'name email');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Create an election (admin only)
// @route POST /api/elections
exports.createElection = [
  body('title').notEmpty().withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  validate,
  async (req, res) => {
    try {
      const { title, description, startDate, endDate, status } = req.body;
      const election = await Election.create({
        title, description, startDate, endDate, status, createdBy: req.user._id,
      });
      res.status(201).json(election);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  },
];

// @desc  Update an election (admin only)
// @route PUT /api/elections/:id
exports.updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @desc  Delete an election (admin only)
// @route DELETE /api/elections/:id
exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json({ message: 'Election removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
