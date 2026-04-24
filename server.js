import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import dotenv from "dotenv";

dotenv.config();

const app = express();

/* ================= 1. MIDDLEWARE ================= */
app.use(cors({
    origin: ["https://dilla-library-frontend.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
app.use(express.json());

/* ================= 2. DATABASE CONNECTION ================= */
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: { rejectUnauthorized: false }
});

db.connect(err => {
    if (err) console.error("❌ Database Error:", err.message);
    else console.log("✅ Connected to Database");
});

/* ================= 3. CLOUDINARY CONFIGURATION ================= */
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'dilla_library',
        allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    },
});

const upload = multer({ storage });

/* ================= 4. API ENDPOINTS ================= */

// --- NEWS (FETCH) ---
app.get("/api/news", (req, res) => {
    db.query("SELECT * FROM news ORDER BY date DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result); // Images are now full Cloudinary URLs
    });
});

// --- NEWS (CREATE with Cloudinary) ---
app.post("/api/news", upload.single("image"), (req, res) => {
    const { title, category, date, content } = req.body;
    const imageUrl = req.file ? req.file.path : null; // This is the Cloudinary URL

    const sql = "INSERT INTO news (title, category, date, content, image) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [title, category, date, content, imageUrl], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "News added successfully!" });
    });
});

// --- STAFF (FETCH) ---
app.get("/api/staff", (req, res) => {
    db.query("SELECT * FROM staff ORDER BY id ASC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// --- STAFF (CREATE with Cloudinary) ---
app.post("/api/staff", upload.single("image"), (req, res) => {
    const { name, position, campus, bio, email, phone } = req.body;
    const imageUrl = req.file ? req.file.path : null;

    const sql = "INSERT INTO staff (name, position, campus, bio, email, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, position, campus, bio, email, phone, imageUrl], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Staff added successfully!" });
    });
});

// --- EVENTS ---
app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events ORDER BY event_date ASC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// --- CAMPUS & LIBRARIES ---
app.get("/api/campuses-full", (req, res) => {
    const sql = `
        SELECT c.id as campus_id, c.name as campus_name, c.description,
        l.id as lib_id, l.name as lib_name, l.capacity, l.lib_type, l.is_main
        FROM campuses c
        LEFT JOIN libraries l ON c.id = l.campus_id
    `;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        const grouped = results.reduce((acc, curr) => {
            let campus = acc.find(item => item.id === curr.campus_id);
            if (!campus) {
                campus = { id: curr.campus_id, name: curr.campus_name, description: curr.description, libraries: [] };
                acc.push(campus);
            }
            if (curr.lib_id) {
                campus.libraries.push({ id: curr.lib_id, name: curr.lib_name, capacity: curr.capacity, type: curr.lib_type, isMain: curr.is_main });
            }
            return acc;
        }, []);
        res.json(grouped);
    });
});

// --- UTILITY ---
app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    db.query("INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)", [name, email, subject, message], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Message sent!" });
    });
});

app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    db.query("INSERT INTO subscribers (email) VALUES (?)", [email], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Subscribed!" });
    });
});

/* ================= 5. START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Cloudinary-enabled server running on port ${PORT}`));
