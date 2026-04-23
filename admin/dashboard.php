<?php
session_start();
require_once __DIR__ . '/../core/Auth.php';
require_once __DIR__ . '/../models/News.php';
require_once __DIR__ . '/../models/Service.php';

// Only allow logged-in admins
Auth::check();

$newsModel = new News();
$serviceModel = new Service();

$allNews = $newsModel->getAll();
$allServices = $serviceModel->getAll();

?>
<h1>Admin Dashboard</h1>
<p>Total News: <?= count($allNews) ?></p>
<p>Total Services: <?= count($allServices) ?></p>
<a href="logout.php">Logout</a>