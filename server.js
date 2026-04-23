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

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) { fs.mkdirSync(uploadDir); }
app.use("/uploads", express.static(uploadDir));

/* ================= 2. TiDB CONNECTION ================= */
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
    else console.log("✅ Connected to TiDB: dilla_library");
});

/* ================= 3. HELPERS ================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage });

const getBaseUrl = (req) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    return `${protocol}://${req.get("host")}`;
};

/* ================= 4. API ENDPOINTS ================= */

// --- NEWS ---
app.get("/api/news", (req, res) => {
    db.query("SELECT * FROM news ORDER BY date DESC", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Added: Single News Route
app.get("/api/news/:id", (req, res) => {
    db.query("SELECT * FROM news WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "News not found" });
        res.json(result[0]);
    });
});

// --- EVENTS ---
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
        res.json(result);
    });
});

// Added: Single Staff Route (This fixes your "Staff profile not found" error)
app.get("/api/staff/:id", (req, res) => {
    db.query("SELECT * FROM staff WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        if (result.length === 0) return res.status(404).json({ message: "Staff not found" });
        res.json(result[0]);
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
                campus = {
                    id: curr.campus_id,
                    name: curr.campus_name,
                    description: curr.description,
                    libraries: []
                };
                acc.push(campus);
            }
            if (curr.lib_id) {
                campus.libraries.push({
                    id: curr.lib_id,
                    name: curr.lib_name,
                    capacity: curr.capacity,
                    type: curr.lib_type,
                    isMain: curr.is_main 
                });
            }
            return acc;
        }, []);
        res.json(grouped);
    });
});

// --- CONTACTS ---
app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, subject, message], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Message sent!" });
    });
});

// --- SUBSCRIBERS ---
app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    const sql = "INSERT INTO subscribers (email) VALUES (?)";
    db.query(sql, [email], (err) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Subscribed!" });
    });
});

/* ================= 5. START SERVER ================= */
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Server on port ${PORT}`));
