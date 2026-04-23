<?php

class User
{
    private $conn;
    private $table = "users";

    public function __construct($db)
    {
        $this->conn = $db;
    }

    // ============================
    // CREATE USER (REGISTER)
    // ============================
    public function create($email, $password, $role = "admin")
    {
        $query = "INSERT INTO {$this->table} (email, password, role) VALUES (?, ?, ?)";

        $stmt = $this->conn->prepare($query);

        $hashedPassword = password_hash($password, PASSWORD_BCRYPT);

        return $stmt->execute([$email, $hashedPassword, $role]);
    }

    // ============================
    // FIND USER BY EMAIL
    // ============================
    public function findByEmail($email)
    {
        $query = "SELECT * FROM {$this->table} WHERE email = ? LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$email]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ============================
    // FIND USER BY TOKEN
    // ============================
    public function findByToken($token)
    {
        $query = "SELECT id, email, role FROM {$this->table} WHERE token = ? LIMIT 1";

        $stmt = $this->conn->prepare($query);
        $stmt->execute([$token]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // ============================
    // UPDATE TOKEN (LOGIN)
    // ============================
    public function updateToken($userId, $token)
    {
        $query = "UPDATE {$this->table} SET token = ? WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$token, $userId]);
    }

    // ============================
    // CLEAR TOKEN (LOGOUT)
    // ============================
    public function clearToken($token)
    {
        $query = "UPDATE {$this->table} SET token = NULL WHERE token = ?";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$token]);
    }

    // ============================
    // VERIFY PASSWORD
    // ============================
    public function verifyPassword($inputPassword, $hashedPassword)
    {
        return password_verify($inputPassword, $hashedPassword);
    }

    // ============================
    // GET ALL USERS (ADMIN)
    // ============================
    public function getAll()
    {
        $query = "SELECT id, email, role, created_at FROM {$this->table} ORDER BY id DESC";

        $stmt = $this->conn->query($query);

        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // ============================
    // DELETE USER
    // ============================
    public function delete($id)
    {
        $query = "DELETE FROM {$this->table} WHERE id = ?";

        $stmt = $this->conn->prepare($query);
        return $stmt->execute([$id]);
    }
}