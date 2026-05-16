const { body } = require('express-validator');
const Party = require('../models/Party');
const Candidate = require('../models/Candidate');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/logger');

exports.getParties = async (req, res) => {
  try {
    const parties = await Party.find();
    res.json(parties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getParty = async (req, res) => {
  try {
    const party = await Party.findById(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createParty = [
  body('name').notEmpty().withMessage('Party name is required'),
  body('abbreviation').notEmpty().withMessage('Abbreviation is required'),
  validate,
  async (req, res) => {
    try {
      const { name, abbreviation, description, referenceUrl } = req.body;
      let logoUrl = req.body.logoUrl || '';
      if (req.file) logoUrl = `/uploads/${req.file.filename}`;
      const party = await Party.create({ name, abbreviation, description, logoUrl, referenceUrl, createdBy: req.user._id });
      await logActivity({ req, action: 'Party Creation', status: 'success', severity: 'INFO', details: { partyName: name } });
      res.status(201).json(party);
    } catch (err) {
      if (err.code === 11000) return res.status(400).json({ message: 'Party name already exists' });
      res.status(500).json({ message: err.message });
    }
  }
];

exports.updateParty = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (req.file) updateData.logoUrl = `/uploads/${req.file.filename}`;
    const party = await Party.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    if (!party) return res.status(404).json({ message: 'Party not found' });
    await logActivity({ req, action: 'Party Update', status: 'success', details: { partyId: party._id } });
    res.json(party);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteParty = async (req, res) => {
  try {
    const candidatesCount = await Candidate.countDocuments({ party: req.params.id });
    if (candidatesCount > 0) {
      await logActivity({ req, action: 'Party Deletion', status: 'rejected', reason: 'Has candidates', severity: 'WARNING' });
      return res.status(400).json({ message: 'Cannot delete party with registered candidates.' });
    }
    const party = await Party.findByIdAndDelete(req.params.id);
    if (!party) return res.status(404).json({ message: 'Party not found' });
    await logActivity({ req, action: 'Party Deletion', status: 'success', severity: 'WARNING', details: { partyName: party.name } });
    res.json({ message: 'Party removed' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
