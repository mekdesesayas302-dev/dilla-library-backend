import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

/* ================= 1. ROBUST CORS CONFIG ================= */
app.use(cors({
    origin: ["https://dilla-library-frontend.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(express.json());

/* ================= 2. STATIC UPLOADS ================= */
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

/* ================= 3. TiDB CONNECTION ================= */
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) console.error("❌ TiDB Error:", err.message);
    else console.log("✅ Connected to TiDB Cloud");
});

/* ================= 4. IMAGE URL HELPER ================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const getBaseUrl = (req) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    return `${protocol}://${req.get("host")}`;
};

/* ================= 5. API ROUTES ================= */

// Get All News
app.get("/api/news", (req, res) => {
    db.query("SELECT * FROM news ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Post News
app.post("/api/news", upload.single("image"), (req, res) => {
    const { title, content, excerpt, category, date } = req.body;
    const imagePath = req.file ? `${getBaseUrl(req)}/uploads/${req.file.filename}` : "";
    const sql = "INSERT INTO news (title, content, excerpt, category, image, date) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, content, excerpt, category, imagePath, date], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "News added successfully" });
    });
});

// Get All Events
app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
