const multer = require('multer');
const path = require('path');

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Store files in uploads directory
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Generate unique filename with timestamp
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter for allowed file types
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
    'application/vnd.ms-excel', // .xls
    'text/csv', // .csv
    'image/jpeg',
    'image/png',
    'image/gif',
    'video/mp4',
    'video/webm'
  ];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} is not supported`), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
    files: 10 // Maximum 10 files
  }
});

// Middleware for different upload scenarios
const uploadMiddleware = {
  // Single file upload
  single: (fieldName) => upload.single(fieldName),

  // Multiple files upload
  multiple: (fieldName, maxCount = 10) => upload.array(fieldName, maxCount),

  // Multiple fields upload
  fields: (fields) => upload.fields(fields),

  // Excel/CSV files only
  excelFile: upload.single('file'),

  // Image files only
  imageFile: upload.single('image'),

  // Video files only
  videoFile: upload.single('video'),

  // Exercise media (image + video)
  exerciseMedia: upload.fields([
    { name: 'image', maxCount: 1 },
    { name: 'video', maxCount: 1 }
  ])
};

// Error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Maximum is 10 files.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }

  if (error.message.includes('File type')) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  next(error);
};

module.exports = {
  uploadMiddleware,
  handleUploadError
};