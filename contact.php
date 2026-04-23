<?php
// Enable CORS for local dev (adjust for production)
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");
header("Access-Control-Allow-Methods: POST");

// Include database connection
require_once __DIR__ . '/config/database.php';

$response = ['success' => false, 'message' => 'Something went wrong'];

try {
    // Only accept POST requests
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(405);
        $response['message'] = 'Method not allowed';
        echo json_encode($response);
        exit;
    }

    // Get raw POST data
    $data = json_decode(file_get_contents("php://input"), true);

    // Validate input
    $name = trim($data['name'] ?? '');
    $email = trim($data['email'] ?? '');
    $subject = trim($data['subject'] ?? '');
    $message = trim($data['message'] ?? '');

    if (!$name || !$email || !$message) {
        http_response_code(422);
        $response['message'] = 'Please fill in all required fields';
        echo json_encode($response);
        exit;
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(422);
        $response['message'] = 'Invalid email address';
        echo json_encode($response);
        exit;
    }

    // Prepare SQL
    $stmt = $pdo->prepare("INSERT INTO contact_us (name, email, subject, message, created_at) VALUES (:name, :email, :subject, :message, NOW())");
    $stmt->execute([
        ':name' => $name,
        ':email' => $email,
        ':subject' => $subject,
        ':message' => $message
    ]);

    $response['success'] = true;
    $response['message'] = "Thank you! Your message has been sent.";
    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    $response['message'] = "Database error: " . $e->getMessage();
    echo json_encode($response);
    exit;
}