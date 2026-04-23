<?php
require_once __DIR__ . '/../config/database.php';

class Service {
    private $conn;
    private $table = "services";

    public function __construct() {
        $this->conn = Database::getConnection();
    }

    // Fetch all services
    public function getAll() {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    // Fetch a single service by ID
    public function getById($id) {
        $stmt = $this->conn->prepare("SELECT * FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Create a new service
    public function create($name, $description, $icon) {
        $stmt = $this->conn->prepare("INSERT INTO {$this->table} (name, description, icon, created_at) VALUES (:name, :description, :icon, NOW())");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':icon', $icon);
        return $stmt->execute();
    }

    // Update a service
    public function update($id, $name, $description, $icon) {
        $stmt = $this->conn->prepare("UPDATE {$this->table} SET name = :name, description = :description, icon = :icon, updated_at = NOW() WHERE id = :id");
        $stmt->bindParam(':name', $name);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':icon', $icon);
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }

    // Delete a service
    public function delete($id) {
        $stmt = $this->conn->prepare("DELETE FROM {$this->table} WHERE id = :id");
        $stmt->bindParam(':id', $id, PDO::PARAM_INT);
        return $stmt->execute();
    }
}