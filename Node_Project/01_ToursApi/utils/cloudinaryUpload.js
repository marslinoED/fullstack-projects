// utils/cloudinaryUpload.js
const cloudinary = require("./cloudinaryConfig");

module.exports = function uploadToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: options.folder || "default-folder",
        public_id: options.public_id || `image_${Date.now()}`,
        format: options.format || "jpeg",
        overwrite: true,
        unique_filename: false,
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};
