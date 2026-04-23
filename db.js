import mysql from "mysql2";

// This will use the variables you set in Render's dashboard
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 4000, // TiDB uses 4000
  ssl: {
    rejectUnauthorized: false // Required for TiDB Cloud
  }
});

db.connect((err) => {
  if (err) {
    console.log("❌ DB Error:", err.message);
  } else {
    console.log("✅ TiDB Connected Successfully");
  }
});

export default db;
