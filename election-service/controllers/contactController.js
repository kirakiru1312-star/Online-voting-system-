const ContactMessage = require('../models/ContactMessage');
const { sendReplyEmail } = require('../services/emailService');
const logActivity = require('../middleware/logger');

exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessageStats = async (req, res) => {
  try {
    const total = await ContactMessage.countDocuments();
    const unread = await ContactMessage.countDocuments({ isRead: false });
    const read = await ContactMessage.countDocuments({ isRead: true });
    res.json({ total, unread, read });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const message = await ContactMessage.findById(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    message.isRead = !message.isRead;
    await message.save();
    res.json(message);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(req.params.id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    await logActivity({ req, action: 'Delete Contact Message', status: 'success', details: { messageId: req.params.id } });
    res.json({ message: 'Message deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.replyToMessage = async (req, res) => {
  try {
    const { id, note } = req.body;
    const message = await ContactMessage.findById(id);
    if (!message) return res.status(404).json({ message: 'Message not found' });
    message.replyNote = note;
    message.repliedAt = new Date();
    message.isRead = true;
    await message.save();
    const recipientEmail = message.email;
    if (recipientEmail) await sendReplyEmail(recipientEmail, note, message.message);
    await logActivity({ req, action: 'Reply to Message', status: 'success', details: { messageId: id } });
    res.json({ message: 'Reply sent successfully via email', data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitMessage = async (req, res) => {
  try {
    let { fullName, email, phone, subject, message } = req.body;
    let userId = null;
    if (req.user) {
      userId = req.user._id;
      fullName = req.user.name;
      email = req.user.email;
      phone = req.user.phone;
    } else {
      if (!fullName || !email) return res.status(400).json({ message: 'Full name and email are required' });
    }
    const newMessage = await ContactMessage.create({ user: userId, fullName, email, phone, subject, message });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
