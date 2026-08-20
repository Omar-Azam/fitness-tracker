import { v2 as cloudinary } from 'cloudinary';
import { Readable } from 'stream';

/**
 * Configure Cloudinary with environment variables.
 * Does NOT throw if variables are missing on startup.
 */
export const configureCloudinary = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (cloudName && apiKey && apiSecret) {
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });
    return true;
  }
  return false;
};

/**
 * Check if Cloudinary is configured
 */
export const isCloudinaryConfigured = () => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;
  return Boolean(cloudName && apiKey && apiSecret);
};

/**
 * Upload an in-memory buffer to Cloudinary using streams
 *
 * @param {Buffer} buffer - File buffer
 * @param {Object} options - Cloudinary upload options
 * @returns {Promise<Object>} Cloudinary upload result
 */
export const uploadBufferToCloudinary = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    // Ensure configuration is applied
    configureCloudinary();

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'fitness-tracker/profile-pictures',
        resource_type: 'image',
        overwrite: true,
        invalidate: true,
        transformation: [
          { width: 500, height: 500, crop: 'fill', gravity: 'face' },
          { quality: 'auto', fetch_format: 'auto' },
        ],
        ...options,
      },
      (error, result) => {
        if (error) {
          return reject(error);
        }
        resolve(result);
      }
    );

    const readable = Readable.from(buffer);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete an asset by public_id from Cloudinary
 *
 * @param {string} publicId - Cloudinary asset public_id
 * @returns {Promise<Object>} Cloudinary deletion result
 */
export const deleteFromCloudinary = async (publicId) => {
  if (!isCloudinaryConfigured()) return null;
  configureCloudinary();
  try {
    return await cloudinary.uploader.destroy(publicId, { invalidate: true });
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete asset ${publicId}:`, error.message);
    return null;
  }
};

export default cloudinary;
