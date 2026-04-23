const express = require("express");
const router = express.Router();
const db = require("../db");
const nodemailer = require("nodemailer");

/* EMAIL CONFIG */
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "your-email@gmail.com",
    pass: "your-app-password"
  }
});

/* CREATE CONTACT */
router.post("/", (req, res) => {
  const { name, email, subject, message } = req.body;

  db.query(
    "INSERT INTO contacts (name,email,subject,message) VALUES (?,?,?,?)",
    [name, email, subject, message],
    (err) => {
      if (err) return res.status(500).json(err);

      // send email
      transporter.sendMail({
        from: email,
        to: "your-email@gmail.com",
        subject: subject,
        text: message
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