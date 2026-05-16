const nodemailer = require('nodemailer');

const sendReplyEmail = async (userEmail, replyText, originalMessage) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({
    from: '"Voting System Admin" <' + process.env.EMAIL_USER + '>',
    to: userEmail,
    subject: 'Reply to your message',
    html: `<div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:12px;max-width:600px;margin:0 auto"><h2 style="color:#22c55e;text-align:center">Admin Reply</h2><p>An administrator has replied to your message:</p><div style="background:#f8fafc;padding:1.5rem;border-radius:12px;margin:1.5rem 0;border-left:4px solid #22c55e"><p style="margin:0;font-weight:600;color:#1e293b">${replyText}</p></div><div style="margin-top:2rem;padding:1rem;background:#f1f5f9;border-radius:8px"><p style="margin:0;font-size:0.85rem;color:#64748b"><strong>Your original message:</strong></p><p style="margin:0.5rem 0 0;font-size:0.9rem;color:#475569">${originalMessage}</p></div></div>`
  });
};

module.exports = { sendReplyEmail };
