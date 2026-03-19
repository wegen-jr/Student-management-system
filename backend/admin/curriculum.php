<?php
session_start();

$frontend_origin = "http://localhost:5173";
header("Access-Control-Allow-Origin: $frontend_origin");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");

// 🔹 Handle preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}
// ------------------
// 3️⃣ Session timeout check
// ------------------
$timeout = 1800;
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > $timeout)) {
    session_unset();
    session_destroy();
    echo json_encode(["error" => "Session expired"]);
    exit();
}
$_SESSION['last_activity'] = time();

// ------------------
// 4️⃣ Database connection
// ------------------
require "../config/database.php";

// ------------------
// 5️⃣ Handle POST request
// ------------------
$method = $_SERVER['REQUEST_METHOD'];

if ($method === "POST") {
    $data = json_decode(file_get_contents("php://input"), true);

    // ✅ Validation
    if (!$data || !isset($data['year'], $data['semester'], $data['courses']) || !is_array($data['courses']) || count($data['courses']) === 0) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing fields"]);
        exit(); // <-- use exit, not break
    }

    $year = (int)$data['year'];
    $semester = (int)$data['semester'];
    $courses = $data['courses'];
    $department_id = $_SESSION['department_id'];

    mysqli_begin_transaction($conn);

    try {
        // Insert into curriculum
        $stmt = $conn->prepare("INSERT INTO curriculum (department_id, year, semester) VALUES (?, ?, ?)");
        $stmt->bind_param("iii", $department_id, $year, $semester);
        $stmt->execute();
        $curriculum_id = $stmt->insert_id;
        $stmt->close();

        // Insert into curriculum_courses
        $stmt = $conn->prepare("INSERT INTO curriculum_courses (curriculum_id, course_id) VALUES (?, ?)");
        foreach ($courses as $course_id) {
            $stmt->bind_param("ii", $curriculum_id, $course_id);
            $stmt->execute();
        }
        $stmt->close();

        mysqli_commit($conn);
        echo json_encode([
            "success" => true,
            "message"=>"curriculum registered succssfully!"
            ]
    );
    } catch (Exception $e) {
        mysqli_rollback($conn);
        http_response_code(500);
        echo json_encode(["error" => "Database error: " . $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>