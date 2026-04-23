const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();

app.use(cors());
app.use(express.json());

// Create uploads folder if it doesn't exist to prevent errors
const uploadDir = "./uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
app.use("/uploads", express.static("uploads"));

/* ================= MYSQL CONNECTION ================= */
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "dilla_library"
});

db.connect(err => {
  if (err) {
    console.error("DB Connection Error:", err);
  } else {
    console.log("MySQL Connected to dilla_library...");
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

// FIX: Added Get Single News by ID
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

// FIX: Added Get Single Staff by ID (Crucial for StaffDetails page)
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

app.post("/api/campuses", (req, res) => {
  const { name, description } = req.body;
  db.query("INSERT INTO campuses (name, description) VALUES (?, ?)", [name, description], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Campus added" });
  });
});

app.post("/api/libraries", (req, res) => {
  const { campus_id, name, capacity, is_main, lib_type } = req.body;
  const sql = "INSERT INTO libraries (campus_id, name, capacity, is_main, lib_type) VALUES (?, ?, ?, ?, ?)";
  db.query(sql, [campus_id, name, capacity, is_main ? 1 : 0, lib_type], (err) => {
    if (err) return res.status(500).json({ message: "Database error" });
    res.json({ message: "Library added" });
  });
});

/* ================= SERVER START ================= */
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});