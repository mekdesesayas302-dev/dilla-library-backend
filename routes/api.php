<?php

// -------------------- HEADERS (CORS + JSON) --------------------
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// -------------------- INCLUDES --------------------
require_once __DIR__ . '/../controllers/AuthController.php';
require_once __DIR__ . '/../controllers/NewsController.php';
require_once __DIR__ . '/../controllers/ServiceController.php';
require_once __DIR__ . '/../core/Middleware.php';

// -------------------- CONTROLLERS --------------------
$authController = new AuthController();
$newsController = new NewsController();
$serviceController = new ServiceController();

// -------------------- REQUEST INFO --------------------
$method = $_SERVER['REQUEST_METHOD'];

// ✅ FIXED ROUTING (IMPORTANT)
$route = $_GET['route'] ?? '';
$uri = explode('/', trim($route, '/'));

// -------------------- HELPER --------------------
function getJsonInput() {
    return json_decode(file_get_contents('php://input'), true);
}

// -------------------- AUTH ROUTES --------------------
if ($uri[0] === 'login' && $method === 'POST') {
    $authController->login(getJsonInput());
    exit;
}

if ($uri[0] === 'logout' && $method === 'POST') {
    $authController->logout();
    exit;
}

if ($uri[0] === 'register' && $method === 'POST') {
    $authController->register(getJsonInput());
    exit;
}

// -------------------- NEWS ROUTES --------------------
if ($uri[0] === 'news') {
    switch ($method) {

        case 'GET':
            if (isset($uri[1])) {
                $newsController->show($uri[1]);
            } else {
                $newsController->index();
            }
            break;

        case 'POST':
            Middleware::auth();
            $newsController->store(getJsonInput());
            break;

        case 'PUT':
            Middleware::auth();
            if (isset($uri[1])) {
                $newsController->updateNews($uri[1], getJsonInput());
            }
            break;

        case 'DELETE':
            Middleware::auth();
            if (isset($uri[1])) {
                $newsController->deleteNews($uri[1]);
            }
            break;
    }
    exit;
}

// -------------------- SERVICE ROUTES --------------------
if ($uri[0] === 'services') {
    switch ($method) {

        case 'GET':
            if (isset($uri[1])) {
                $serviceController->show($uri[1]);
            } else {
                $serviceController->index();
            }
            break;

        case 'POST':
            Middleware::auth();
            $serviceController->store(getJsonInput());
            break;

        case 'PUT':
            Middleware::auth();
            if (isset($uri[1])) {
                $serviceController->updateService($uri[1], getJsonInput());
            }
            break;

        case 'DELETE':
            Middleware::auth();
            if (isset($uri[1])) {
                $serviceController->deleteService($uri[1]);
            }
            break;
    }
    exit;
}

// -------------------- DEFAULT --------------------
http_response_code(404);
echo json_encode([
    "status" => "error",
    "message" => "Endpoint not found"
]);
exit;