import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();

/* ================= 1. MIDDLEWARE ================= */
app.use(cors({
    origin: ["https://dilla-library-frontend.vercel.app", "http://localhost:5173"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true
}));
app.use(express.json());

// Set up and serve the uploads folder
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir, { recursive: true }); }
app.use("/uploads", express.static(uploadDir));

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

/* ================= 3. HELPERS & IMAGE FIXER ================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

// This function fixes the "localhost" issue by creating a valid live link
const fixImageUrl = (req, dbPath) => {
    if (!dbPath) return null;
    const protocol = req.headers['x-forwarded-proto'] || 'https';
    const host = req.get("host");
    const baseUrl = `${protocol}://${host}`;
    
    // Extracts only the filename (e.g. 'exit-exam.jpg') and adds the live URL
    const filename = dbPath.split(/[\\/]/).pop();
    return `${baseUrl}/uploads/${filename}`;
};

/* ================= 4. API ENDPOINTS ================= */

// --- NEWS ---
app.get("/api/news", (req, res) => {
    db.query("SELECT * FROM news ORDER BY date DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const data = result.map(item => ({ ...item, image: fixImageUrl(req, item.image) }));
        res.json(data);
    });
});

app.get("/api/news/:id", (req, res) => {
    db.query("SELECT * FROM news WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "News not found" });
        const news = result[0];
        news.image = fixImageUrl(req, news.image);
        res.json(news);
    });
});

// --- EVENTS (This fixes your 404 error) ---
app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events ORDER BY event_date ASC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// --- STAFF ---
app.get("/api/staff", (req, res) => {
    db.query("SELECT * FROM staff ORDER BY id ASC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        const data = result.map(item => ({ ...item, image: fixImageUrl(req, item.image) }));
        res.json(data);
    });
});

app.get("/api/staff/:id", (req, res) => {
    db.query("SELECT * FROM staff WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Staff not found" });
        const staff = result[0];
        staff.image = fixImageUrl(req, staff.image);
        res.json(staff);
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
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server running on port ${PORT}`));
