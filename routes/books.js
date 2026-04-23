const express = require("express");
const router = express.Router();

// Example (replace with DB later)
const books = [
  {
    id: 1,
    title: "Introduction to Algorithms",
    author: "Thomas H. Cormen",
    isbn: "978-0262033848",
    category: "Computer Science",
    year: 2009,
    status: "Available",
    copies: 3
  }
];

// ✅ GET all books
router.get("/", (req, res) => {
  res.json(books);
});

module.exports = router;