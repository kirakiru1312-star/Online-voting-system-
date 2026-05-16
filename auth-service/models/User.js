const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['admin', 'voter'], default: 'voter' },
    age: { type: Number },
    phone: { type: String, unique: true, sparse: true },
    nationalId: { type: String, unique: true, sparse: true },
    profession: { type: String },
    nationality: { type: String, default: 'Ethiopian' },
    region: { type: String },
    subCity: { type: String },
    kebele: { type: String },
    hasVoted: { type: Boolean, default: false },
    votedAt: { type: Date },
    otpCode: { type: String },
    otpExpire: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
