<?php
$host = "localhost";
$db_name = "du_library";
$username = "root"; // Default for XAMPP
$password = "";     // Default for XAMPP

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch(PDOException $e) {
    die("Connection failed: " . $e->getMessage());
}
?>