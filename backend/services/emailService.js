const nodemailer = require('nodemailer');

const sendOTP = async (userEmail, otpCode) => {
  // NOTE: In production, use environment variables for email and password
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com',
      pass: process.env.EMAIL_PASS || 'your-app-password'
    }
  });

  const mailOptions = {
    from: '"Voting System" <your-email@gmail.com>',
    to: userEmail,
    subject: "Verification Code",
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4f46e5; text-align: center;">Email Verification</h2>
        <p>Hello,</p>
        <p>Your one-time verification code (OTP) for the Voting System is:</p>
        <div style="font-size: 2.5rem; font-weight: 800; text-align: center; color: #4f46e5; letter-spacing: 0.5rem; margin: 2rem 0; padding: 1.5rem; background: #f8fafc; border-radius: 12px;">
          ${otpCode}
        </div>
        <p style="color: #64748b; font-size: 0.9rem; text-align: center;">This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 2rem 0;">
        <p style="font-size: 0.8rem; color: #94a3b8; text-align: center;">© 2026 Online Voting System. All rights reserved.</p>
      </div>
    `
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOTP };
