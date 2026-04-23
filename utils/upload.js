import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

export const uploadImage = [
  upload.single("image"),
  async (req, res) => {
    try {
      const result = await cloudinary.uploader.upload_stream(
        { resource_type: "image" },
        (error, result) => {
          if (error) return res.status(500).json(error);
          res.json({ url: result.secure_url });
        }
      ).end(req.file.buffer);
    } catch (err) {
      res.status(500).json(err);
    }
  }
];