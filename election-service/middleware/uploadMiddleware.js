const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Save uploads to the shared backend/uploads folder so images are always accessible
const uploadDir = path.join(__dirname, '..', 'backend', 'uploads');
if (!fs.existsSync(uploadDir)) {
  // Fallback to local uploads if backend folder doesn't exist
  const localDir = path.join(__dirname, 'uploads');
  if (!fs.existsSync(localDir)) fs.mkdirSync(localDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, fs.existsSync(uploadDir) ? uploadDir : path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });
module.exports = upload;
