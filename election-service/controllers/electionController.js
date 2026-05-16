const { body } = require('express-validator');
const Election = require('../models/Election');
const validate = require('../middleware/validate');

exports.getElections = async (req, res) => {
  try {
    const elections = await Election.find();
    res.json(elections);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getElection = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createElection = [
  body('title').notEmpty().withMessage('Title is required'),
  body('startDate').isISO8601().withMessage('Valid start date required'),
  body('endDate').isISO8601().withMessage('Valid end date required'),
  validate,
  async (req, res) => {
    try {
      const { title, description, startDate, endDate, status, type } = req.body;
      const election = await Election.create({ title, description, startDate, endDate, status, type, createdBy: req.user._id });
      res.status(201).json(election);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
];

exports.updateElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteElection = async (req, res) => {
  try {
    const election = await Election.findByIdAndDelete(req.params.id);
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json({ message: 'Election removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
