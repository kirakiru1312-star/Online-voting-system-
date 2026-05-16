const nodemailer = require('nodemailer');

const sendOTP = async (userEmail, otpCode) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
  });
  await transporter.sendMail({
    from: '"Voting System" <' + process.env.EMAIL_USER + '>',
    to: userEmail,
    subject: 'Verification Code',
    html: `<div style="font-family:Arial,sans-serif;padding:20px;border:1px solid #e2e8f0;border-radius:12px;max-width:600px;margin:0 auto"><h2 style="color:#4f46e5;text-align:center">Email Verification</h2><p>Your one-time verification code is:</p><div style="font-size:2.5rem;font-weight:800;text-align:center;color:#4f46e5;letter-spacing:0.5rem;margin:2rem 0;padding:1.5rem;background:#f8fafc;border-radius:12px">${otpCode}</div><p style="color:#64748b;font-size:0.9rem;text-align:center">Valid for <strong>10 minutes</strong>. Do not share this code.</p></div>`
  });
};

module.exports = { sendOTP };
