const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

const makeAdmin = async () => {
  try {
    // Connect to the database
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to Database.');

    // Get the email from the terminal arguments
    const emailToPromote = process.argv[2];

    if (!emailToPromote) {
      console.log('Please provide an email! Example: node makeAdmin.js your_email@gmail.com');
      process.exit(1);
    }

    // Find the user and update their role
    const user = await User.findOneAndUpdate(
      { email: emailToPromote },
      { role: 'admin' },
      { new: true }
    );

    if (!user) {
      console.log(`User with email ${emailToPromote} not found in the database.`);
    } else {
      console.log(`Success! ${user.name} (${user.email}) is now an ADMIN.`);
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
};

makeAdmin();
