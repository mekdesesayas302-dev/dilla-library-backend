const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");

/* EMAIL CONFIG (Use Environment Variables!) */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Set this in Render Dashboard
    pass: process.env.EMAIL_PASS  // Set this in Render Dashboard
  }
});

/* CREATE CONTACT */
router.post("/", (req, res) => {
  const { name, email, subject, message } = req.body;

  db.query(
    "INSERT INTO contacts (name, email, subject, message) VALUES (?,?,?,?)",
    [name, email, subject, message],
    (err) => {
      if (err) {
        console.error("DB Error:", err);
        return res.status(500).json({ error: "Database insertion failed" });
      }

      // send email notifications
      const mailOptions = {
        from: process.env.EMAIL_USER, // Must be your authenticated email
        replyTo: email,              // The person who filled the form
        to: process.env.EMAIL_USER,   // Where you want to receive the mail
        subject: `Library Contact: ${subject}`,
        text: `From: ${name} (${email})\n\nMessage: ${message}`
      };

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.error("Email Error:", error);
      });

      res.json({ success: true });
    }
  );
});

/* GET ALL */
router.get("/", (req, res) => {
  db.query("SELECT * FROM contacts ORDER BY id DESC", (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
});

/* DELETE */
router.delete("/:id", (req, res) => {
  db.query("DELETE FROM contacts WHERE id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

module.exports = router;
