const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload root and subfolders exist
const ensureDirExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let subfolder = 'uploads';
    if (req.query.type === 'unit' || req.query.type === 'units') {
      subfolder = path.join('uploads', 'units');
    } else if (req.query.type === 'payment' || req.query.type === 'payments') {
      subfolder = path.join('uploads', 'payments');
    }
    ensureDirExists(subfolder);
    cb(null, subfolder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanBasename = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .substring(0, 30);
    cb(null, `${cleanBasename}-${uniqueSuffix}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format file tidak didukung! Hanya gambar JPEG, JPG, PNG, dan WEBP yang diperbolehkan.'), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB max
  },
  fileFilter,
});

module.exports = upload;
