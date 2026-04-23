<?php

class Auth
{
    // Generate a secure token
    public static function generateToken($user_id)
    {
        return hash(
            "sha256",
            $user_id . bin2hex(random_bytes(32)) . time()
        );
    }

    // Set authentication cookie (secure)
    public static function setCookie($token)
    {
        $isSecure = isset($_SERVER['HTTPS']) && $_SERVER['HTTPS'] === 'on';

        setcookie(
            "auth_token",
            $token,
            [
                'expires' => time() + (60 * 60 * 24 * 7), // 7 days
                'path' => '/',
                'domain' => '', // keep empty for localhost or set your domain
                'secure' => $isSecure, // true in HTTPS
                'httponly' => true, // prevent JS access
                'samesite' => 'Strict' // CSRF protection
            ]
        );
    }

    // Get token from cookie
    public static function getToken()
    {
        return $_COOKIE['auth_token'] ?? null;
    }

    // Validate token from database
    public static function validate($db)
    {
        $token = self::getToken();

        if (!$token) {
            return false;
        }

        $stmt = $db->prepare("SELECT id, email FROM users WHERE token = ?");
        $stmt->execute([$token]);

        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    // Require authentication (used in protected routes)
    public static function requireAuth($db)
    {
        $user = self::validate($db);

        if (!$user) {
            http_response_code(401);
            echo json_encode([
                "status" => "error",
                "message" => "Unauthorized access"
            ]);
            exit;
        }

        return $user; // return logged-in user info
    }

    // Logout user (clear cookie + DB token)
    public static function logout($db)
    {
        $token = self::getToken();

        if ($token) {
            $stmt = $db->prepare("UPDATE users SET token = NULL WHERE token = ?");
            $stmt->execute([$token]);
        }

        // Delete cookie
        setcookie(
            "auth_token",
            "",
            [
                'expires' => time() - 3600,
                'path' => '/',
                'domain' => '',
                'secure' => false,
                'httponly' => true,
                'samesite' => 'Strict'
            ]
        );

        return [
            "status" => "success",
            "message" => "Logged out successfully"
        ];
    }

    // Optional: check if user is logged in (without stopping script)
    public static function check($db)
    {
        return self::validate($db) ? true : false;
    }
}