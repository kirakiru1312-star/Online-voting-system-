const ContactMessage = require('../models/ContactMessage');
const User = require('../models/User');
const { sendReplyEmail } = require('../services/emailService');
const logActivity = require('../middleware/logger');

exports.getMessages = async (req, res) => {
  try {
    const messages = await ContactMessage.find()
      .populate('user', 'name email phone')
      .sort({ createdAt: -1 });
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

    // Send reply via email
    // Prioritize populated user email, fallback to snapshot email
    const recipientEmail = message.user?.email || message.email;
    if (recipientEmail) {
      await sendReplyEmail(recipientEmail, note, message.message);
    }
    
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

    // If user is logged in, retrieve their info automatically
    if (req.user) {
      userId = req.user.id;
      fullName = req.user.name;
      email = req.user.email;
      phone = req.user.phone;
    } else {
      // Basic validation for guest users as per original logic
      if (!fullName || !email) {
        return res.status(400).json({ message: 'Full name and email are required' });
      }
    }

    const newMessage = await ContactMessage.create({
      user: userId,
      fullName,
      email,
      phone,
      subject,
      message
    });
    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
