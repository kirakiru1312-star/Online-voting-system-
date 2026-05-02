const ContactMessage = require('../models/ContactMessage');
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
    
    await logActivity({ req, action: 'Reply to Message', status: 'success', details: { messageId: id } });
    
    res.json({ message: 'Reply saved successfully', data: message });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.submitMessage = async (req, res) => {
  try {
    const { fullName, email, phone, subject, message } = req.body;
    const newMessage = await ContactMessage.create({
      fullName, email, phone, subject, message
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
