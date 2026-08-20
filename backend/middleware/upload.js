import multer from 'multer';

// Use in-memory storage so the buffer can be piped directly to Cloudinary
const storage = multer.memoryStorage();

// Allowed MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// File filter function
const fileFilter = (req, file, cb) => {
  if (ALLOWED_MIME_TYPES.includes(file.mimetype.toLowerCase())) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPG, PNG, and WebP images are allowed.');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Multer upload instance
const upload = multer({
  storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB max
    files: 1,
  },
  fileFilter,
});

/**
 * Middleware wrapper for single file upload that catches and formats Multer errors
 * Accepts fields: 'picture', 'profilePicture', or 'image'
 */
export const handleProfilePictureUpload = (req, res, next) => {
  const singleUpload = upload.single('picture');

  singleUpload(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            error: 'File is too large. Maximum allowed size is 2MB.',
          });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
          return res.status(400).json({
            error: `Unexpected field '${err.field}'. Please upload the image under the field name 'picture'.`,
          });
        }
        return res.status(400).json({
          error: `Upload error: ${err.message}`,
        });
      }

      if (err.code === 'INVALID_FILE_TYPE' || err.statusCode === 400) {
        return res.status(400).json({
          error: err.message || 'Invalid file type. Only JPG, PNG, and WebP images are allowed.',
        });
      }

      return res.status(400).json({
        error: err.message || 'Failed to process uploaded file',
      });
    }

    next();
  });
};

export default upload;
