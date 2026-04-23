import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// Fix for __dirname in ES Modules (Required for static file serving on Render)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

/* ================= MIDDLEWARE ================= */
// Use the FRONTEND_URL from your Render Environment Variables for better security
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// Create uploads folder if it doesn't exist
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

/* ================= TIDB CONNECTION ================= */
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: {
        rejectUnauthorized: false // Crucial for TiDB Cloud connection
    }
});

db.connect(err => {
    if (err) {
        console.error("❌ TiDB Connection Error:", err.message);
    } else {
        console.log("✅ Connected to TiDB Cloud (dilla_library)");
    }
});

/* ================= FILE UPLOAD CONFIG ================= */
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

/* ================= SUBSCRIBE API ================= */
app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!email || !emailRegex.test(email)) {
        return res.status(400).json({ message: "Valid email required" });
    }

    const sql = "INSERT INTO subscribers (email) VALUES (?)";
    db.query(sql, [email], (err) => {
        if (err) {
            if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "Already subscribed" });
            return res.status(500).json({ message: "Database error" });
        }
        res.json({ message: "Subscribed successfully!" });
    });
});

/* ================= CONTACT API ================= */
app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !message) return res.status(400).json({ message: "All fields required" });

    const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, subject, message], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Message saved successfully" });
    });
});

app.get("/api/contact", (req, res) => {
    db.query("SELECT * FROM contacts ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to fetch contacts" });
        res.json(result);
    });
});

/* ================= NEWS API ================= */
app.get("/api/news", (req, res) => {
    db.query("SELECT * FROM news ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to fetch news" });
        res.json(result);
    });
});

app.get("/api/news/:id", (req, res) => {
    db.query("SELECT * FROM news WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "News not found" });
        res.json(result[0]);
    });
});

app.post("/api/news", upload.single("image"), (req, res) => {
    const { title, content, excerpt, category, date } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const image = req.file ? `${baseUrl}/uploads/${req.file.filename}` : "";

    const sql = "INSERT INTO news (title, content, excerpt, category, image, date) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, content, excerpt, category, image, date], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "News added" });
    });
});

/* ================= EVENTS API ================= */
app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to fetch events" });
        res.json(result);
    });
});

app.post("/api/events", (req, res) => {
    const { title, description, event_date, time, location } = req.body;
    const sql = "INSERT INTO events (title, description, event_date, time, location) VALUES (?, ?, ?, ?, ?)";
    db.query(sql, [title, description, event_date, time, location], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Event added" });
    });
});

/* ================= STAFF API ================= */
app.get("/api/staff", (req, res) => {
    db.query("SELECT * FROM staff ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Failed to fetch staff" });
        res.json(result);
    });
});

app.get("/api/staff/:id", (req, res) => {
    db.query("SELECT * FROM staff WHERE id = ?", [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "Staff not found" });
        res.json(result[0]);
    });
});

app.post("/api/staff", upload.single("image"), (req, res) => {
    const { name, position, campus, department, bio, email, phone } = req.body;
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const image = req.file ? `${baseUrl}/uploads/${req.file.filename}` : "";

    const sql = "INSERT INTO staff (name, position, campus, department, bio, email, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, position, campus, department, bio, email, phone, image], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Staff added successfully" });
    });
});

/* ================= CAMPUSES & LIBRARIES API ================= */
app.get("/api/campuses-full", (req, res) => {
    const sql = `
    SELECT 
      c.id as campus_id, c.name as campus_name, c.description,
      l.id as lib_id, l.name as lib_name, l.capacity, l.is_main, l.lib_type
    FROM campuses c
    LEFT JOIN libraries l ON c.id = l.campus_id
    ORDER BY c.id ASC
  `;

    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error", error: err });

        const formattedData = rows.reduce((acc, row) => {
            let campus = acc.find(c => c.id === row.campus_id);
            if (!campus) {
                campus = { id: row.campus_id, name: row.campus_name, description: row.description, libraries: [] };
                acc.push(campus);
            }
            if (row.lib_id) {
                campus.libraries.push({
                    id: row.lib_id,
                    name: row.lib_name,
                    capacity: row.capacity,
                    isMain: !!row.is_main,
                    type: row.lib_type
                });
            }
            return acc;
        }, []);

        res.json(formattedData);
    });
});

/* ================= SERVER START ================= */
// Use process.env.PORT for Render deployment
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
