<?php

require_once __DIR__ . '/Auth.php';

class Middleware
{
    // Protect route (must be logged in)
    public static function protect($db)
    {
        $user = Auth::validate($db);

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Unauthorized"
            ]);
            exit;
        }

        return $user; // return authenticated user
    }

    // Optional: role-based protection (future use)
    public static function role($db, $requiredRole)
    {
        $user = Auth::validate($db);

        if (!$user || !isset($user['role']) || $user['role'] !== $requiredRole) {
            http_response_code(403);
            echo json_encode([
                "status" => "error",
                "message" => "Forbidden - insufficient permissions"
            ]);
            exit;
        }

        return $user;
    }

    // Only allow specific HTTP methods
    public static function allowMethod($methods = [])
    {
        $requestMethod = $_SERVER['REQUEST_METHOD'];

        if (!in_array($requestMethod, $methods)) {
            http_response_code(405);
            echo json_encode([
                "status" => "error",
                "message" => "Method Not Allowed"
            ]);
            exit;
        }
    }

    // Basic input sanitization (extra layer)
    public static function sanitize($data)
    {
        if (is_array($data)) {
            return array_map([self::class, 'sanitize'], $data);
        }

        return htmlspecialchars(strip_tags(trim($data)));
    }

    // JSON request body parser (safe)
    public static function getJsonInput()
    {
        $input = json_decode(file_get_contents("php://input"), true);

        if (!$input) {
            http_response_code(400);
            echo json_encode([
                "status" => "error",
                "message" => "Invalid JSON input"
            ]);
            exit;
        }

        return self::sanitize($input);
    }

    // CORS handler (important for React frontend)
    public static function cors()
    {
        header("Access-Control-Allow-Origin: http://localhost:3000");
        header("Access-Control-Allow-Credentials: true");
        header("Access-Control-Allow-Headers: Content-Type, Authorization");
        header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit;
        }
    }
}