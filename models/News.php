<?php
require_once __DIR__ . '/../config/database.php';

class News {
    private $conn;
    private $table = "news";

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    // Fetch all news
    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single news item by ID
    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a news item
    public function create($title, $content, $author) {
        $stmt = $this->conn->prepare("INSERT INTO {$this->table} (title, content, author, created_at) VALUES (:title, :content, :author, NOW())");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':author', $author);
        return $stmt->execute();
    }

    // Update a news item
    public function update($id, $title, $content, $author) {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET title = :title, content = :content, author = :author, updated_at = NOW() WHERE id = :id");
        $stmt->bindParam(':title', $title);
        $stmt->bindParam(':content', $content);
        $stmt->bindParam(':author', $author);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // Delete a news item
    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}