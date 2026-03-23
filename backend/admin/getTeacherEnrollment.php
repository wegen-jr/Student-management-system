<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

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

if (!isset($_SESSION['department_id'])) {
    http_response_code(401);
    echo json_encode(["error" => "Unauthorized: department not set"]);
    exit;
}
$department_id = $_SESSION['department_id'];

require "../config/database.php";

if (!$conn) {
    http_response_code(500);
    echo json_encode(["error" => "Database connection failed"]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    $sql = "
        SELECT en.id, en.teacher_id, en.course_id, en.section_id, t.user_id, s.room,
               c.course_name,
               CONCAT(u.first_name,' ',u.middle_name,' ',u.last_name) AS full_name
        FROM teachers_enrollment en
        LEFT JOIN teacher t ON en.teacher_id = t.teacher_id
        LEFT JOIN section s ON en.section_id = s.id
        LEFT JOIN course c ON en.course_id = c.id
        LEFT JOIN users u ON t.user_id = u.id
        WHERE t.department_id = ?
    ";

    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        echo json_encode(["error" => "Prepare failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param('i', $department_id);
    if (!$stmt->execute()) {
        http_response_code(500);
        echo json_encode(["error" => "Execute failed: " . $stmt->error]);
        exit;
    }

    $result = $stmt->get_result();
    $data = [];
    while ($row = $result->fetch_assoc()) {
        $data[] = $row;
    }

    $stmt->close();
    echo json_encode(["success" => true, "data" => $data]);
}
?>