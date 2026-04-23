import express from "express";
import cors from "cors";
import mysql from "mysql2";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

// --- ES MODULE FIXES ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// --- MIDDLEWARE ---
app.use(cors({
    origin: process.env.FRONTEND_URL || "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));
app.use(express.json());

// --- UPLOADS DIRECTORY ---
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static(uploadDir));

// --- TIDB DATABASE CONNECTION ---
const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 4000,
    ssl: {
        rejectUnauthorized: false // Required for TiDB Cloud
    }
});

db.connect(err => {
    if (err) {
        console.error("❌ TiDB Connection Error:", err.message);
    } else {
        console.log("✅ Connected to TiDB Cloud (dilla_library)");
    }
});

// --- MULTER STORAGE CONFIG ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// --- HELPER: GENERATE PUBLIC URL ---
// This prevents saving "localhost" into the database on Render
const getBaseUrl = (req) => {
    const protocol = req.headers['x-forwarded-proto'] || req.protocol;
    const host = req.get("host");
    return `${protocol}://${host}`;
};

/* ================= API ENDPOINTS ================= */

// --- NEWS API ---
app.get("/api/news", (req, res) => {
    const sql = "SELECT * FROM news ORDER BY id DESC";
    db.query(sql, (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching news" });
        res.json(result);
    });
});

app.get("/api/news/:id", (req, res) => {
    const sql = "SELECT * FROM news WHERE id = ?";
    db.query(sql, [req.params.id], (err, result) => {
        if (err) return res.status(500).json({ message: "Database error" });
        if (result.length === 0) return res.status(404).json({ message: "News not found" });
        res.json(result[0]);
    });
});

app.post("/api/news", upload.single("image"), (req, res) => {
    const { title, content, excerpt, category, date } = req.body;
    const imagePath = req.file ? `${getBaseUrl(req)}/uploads/${req.file.filename}` : "";

    const sql = "INSERT INTO news (title, content, excerpt, category, image, date) VALUES (?, ?, ?, ?, ?, ?)";
    db.query(sql, [title, content, excerpt, category, imagePath, date], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "News added successfully" });
    });
});

// --- EVENTS API ---
app.get("/api/events", (req, res) => {
    db.query("SELECT * FROM events ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching events" });
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

// --- STAFF API ---
app.get("/api/staff", (req, res) => {
    db.query("SELECT * FROM staff ORDER BY id DESC", (err, result) => {
        if (err) return res.status(500).json({ message: "Error fetching staff" });
        res.json(result);
    });
});

app.post("/api/staff", upload.single("image"), (req, res) => {
    const { name, position, campus, department, bio, email, phone } = req.body;
    const imagePath = req.file ? `${getBaseUrl(req)}/uploads/${req.file.filename}` : "";

    const sql = "INSERT INTO staff (name, position, campus, department, bio, email, phone, image) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
    db.query(sql, [name, position, campus, department, bio, email, phone, imagePath], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Staff added" });
    });
});

// --- CONTACT & SUBSCRIBE ---
app.post("/api/subscribe", (req, res) => {
    const { email } = req.body;
    const sql = "INSERT INTO subscribers (email) VALUES (?)";
    db.query(sql, [email], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Subscribed!" });
    });
});

app.post("/api/contact", (req, res) => {
    const { name, email, subject, message } = req.body;
    const sql = "INSERT INTO contacts (name, email, subject, message) VALUES (?, ?, ?, ?)";
    db.query(sql, [name, email, subject, message], (err) => {
        if (err) return res.status(500).json({ message: "Database error" });
        res.json({ message: "Message saved" });
    });
});

// --- CAMPUSES ---
app.get("/api/campuses-full", (req, res) => {
    const sql = `
        SELECT c.id as campus_id, c.name as campus_name, c.description,
               l.id as lib_id, l.name as lib_name, l.capacity, l.is_main, l.lib_type
        FROM campuses c
        LEFT JOIN libraries l ON c.id = l.campus_id
        ORDER BY c.id ASC
    `;
    db.query(sql, (err, rows) => {
        if (err) return res.status(500).json({ message: "Database error" });
        
        const formattedData = rows.reduce((acc, row) => {
            let campus = acc.find(c => c.id === row.campus_id);
            if (!campus) {
                campus = { id: row.campus_id, name: row.campus_name, description: row.description, libraries: [] };
                acc.push(campus);
            }
            if (row.lib_id) {
                campus.libraries.push({
                    id: row.lib_id, name: row.lib_name, capacity: row.capacity,
                    isMain: !!row.is_main, type: row.lib_type
                });
            }
            return acc;
        }, []);
        res.json(formattedData);
    });
});

// --- START SERVER ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
