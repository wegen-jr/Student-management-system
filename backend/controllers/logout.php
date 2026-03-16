<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5371");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

// remove all session variables
$_SESSION = [];

// destroy session
session_destroy();

echo json_encode([
    "success" => true,
    "message" => "Logged out successfully"
]);
?>