<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

// Preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$timeout = 1800; // 30 minutes
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
    session_unset();
    session_destroy();
    echo json_encode(["error" => "Session expired"]);
    exit;
}
$_SESSION['last_activity'] = time();

// Ensure user is logged in and department_id is set
if (!isset($_SESSION['department_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized: department not set"]);
    exit;
}
$department_id = $_SESSION['department_id'];

$method=$_SERVER['REQUEST_METHOD'];

switch($method){
    case 'GET':{

    }
    break;
    case 'POST':{
        
    }
}


?>