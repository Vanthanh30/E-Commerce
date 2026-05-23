import { Readable } from "node:stream";
import cloudinary from "../configs/cloudinary.js";

export function isCloudinaryConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
  );
}

export async function uploadImageBuffer(file) {
  if (!file) return null;
  if (!isCloudinaryConfigured()) {
    const error = new Error("Cloudinary chưa được cấu hình trong server/.env");
    error.status = 400;
    throw error;
  }

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: process.env.CLOUDINARY_FOLDER || "web-tra-gia-noi-that",
        resource_type: "image"
      },
      (error, result) => {
        if (error) reject(error);
        else resolve({
          url: result.secure_url,
          publicId: result.public_id
        });
      }
    );

    Readable.from(file.buffer).pipe(stream);
  });
}
