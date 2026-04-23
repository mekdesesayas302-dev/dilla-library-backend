<?php
require_once __DIR__ . '/../models/User.php';
require_once __DIR__ . '/../core/Response.php';
require_once __DIR__ . '/../core/Auth.php';

class AuthController {
    private $user;

    public function __construct() {
        $this->user = new User();
    }

    public function login($data) {
        $email = $data['email'] ?? '';
        $password = $data['password'] ?? '';

        $user = $this->user->getByEmail($email);
        if ($user && password_verify($password, $user['password'])) {
            Auth::setSession($user); // Save user session
            Response::json(['message' => 'Login successful', 'user' => $user]);
        } else {
            Response::json(['error' => 'Invalid email or password'], 401);
        }
    }

    public function logout() {
        Auth::logout();
        Response::json(['message' => 'Logged out successfully']);
    }

    public function register($data) {
        $name = $data['name'] ?? '';
        $email = $data['email'] ?? '';
        $password = password_hash($data['password'] ?? '', PASSWORD_DEFAULT);

        if ($this->user->create($name, $email, $password)) {
            Response::json(['message' => 'User registered successfully']);
        } else {
            Response::json(['error' => 'Registration failed'], 500);
        }
    }
}