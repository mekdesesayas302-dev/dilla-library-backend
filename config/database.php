<?php

class Database {
    private $host = "localhost";
    private $db_name = "du_library"; // ✅ CORRECT NAME
    private $username = "root";
    private $password = "";

    public $conn;

    public function connect() {
        $this->conn = null;

        try {
            $dsn = "mysql:host={$this->host};dbname={$this->db_name};charset=utf8mb4";

            $this->conn = new PDO($dsn, $this->username, $this->password, [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC
            ]);

        } catch (PDOException $e) {
            http_response_code(500);
            echo json_encode([
                "status" => "error",
                "message" => "Database connection failed"
            ]);
            exit;
        }

        return $this->conn;
    }
}