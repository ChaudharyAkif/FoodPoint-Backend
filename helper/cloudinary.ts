import { v2 as cloudinary } from 'cloudinary';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';
import dotenv from "dotenv";
dotenv.config();

// console.log(process.env.CLOUDINARY_API_KEY)

// Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

// Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    return {
      folder: 'products', // change folder name if needed
      // format: file.mimetype.split('/')[1], // jpg / png
      // public_id: `${Date.now()}-${file.originalname}`,   
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
      transformation: [{ width: 800, height: 800, crop: 'limit' }],
    };
  },
});

// Multer middleware
const upload = multer({ storage });

export { cloudinary, upload };
