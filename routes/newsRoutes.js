import express from "express";
import db from "../db.js";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";

const router = express.Router();

// CLOUDINARY CONFIG
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_KEY,
  api_secret: process.env.CLOUD_SECRET
});

// MULTER
const storage = multer.memoryStorage();
const upload = multer({ storage });


// ✅ GET NEWS
router.get("/", (req, res) => {
  const sql = "SELECT * FROM news ORDER BY created_at DESC";

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});


// ✅ ADD NEWS
router.post("/", (req, res) => {
  const { title, category, date, time, location, excerpt, content, image } = req.body;

  const sql = `
    INSERT INTO news (title, category, date, time, location, excerpt, content, image)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [title, category, date, time, location, excerpt, content, image],
    (err, result) => {
      if (err) return res.status(500).json(err);
      res.json({ message: "News added successfully" });
    }
  );
});


// ✅ IMAGE UPLOAD
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    cloudinary.uploader.upload_stream(
      { resource_type: "image" },
      (error, result) => {
        if (error) return res.status(500).json(error);
        res.json({ url: result.secure_url });
      }
    ).end(req.file.buffer);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;