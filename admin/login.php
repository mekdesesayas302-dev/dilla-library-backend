<?php
session_start();
require_once __DIR__ . '/../controllers/AuthController.php';

$authController = new AuthController();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';

    $authController->login([
        'email' => $email,
        'password' => $password
    ]);
}

// HTML form for login
?>
<form method="POST">
    <input type="email" name="email" placeholder="Email" required />
    <input type="password" name="password" placeholder="Password" required />
    <button type="submit">Login</button>
</form>