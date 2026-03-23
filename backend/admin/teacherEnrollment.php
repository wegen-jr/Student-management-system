<?php
session_start();

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config/database.php";

// Session timeout
$timeout = 1800;

if (isset($_SESSION['last_activity']) &&
    (time() - $_SESSION['last_activity'] > $timeout)) {

    session_unset();
    session_destroy();

    echo json_encode(["error" => "Session expired"]);
    exit;
}

$_SESSION['last_activity'] = time();

// Helper function
function getCurrentCurriculumId($conn, $department_id) {
    $stmt = $conn->prepare("
        SELECT id FROM curriculum 
        WHERE department_id = ? 
        ORDER BY year DESC, semester DESC 
        LIMIT 1
    ");
    $stmt->bind_param("i", $department_id);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    $stmt->close();

    return $row ? $row['id'] : null;
}

// Only POST allowed
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

if (!$data || !isset(
    $data['teacherId'],
    $data['courseCode'],
    $data['block'],
    $data['room'],
    $data['department_id']
)) {
    http_response_code(400);
    echo json_encode(["error" => "Invalid or missing fields"]);
    exit;
}

$teacherId = $data['teacherId'];
$courseCode = $data['courseCode'];
$block = $data['block'];
$room = $data['room'];
$department_id = $data['department_id'];

// Check teacher
$stmt = $conn->prepare("SELECT * FROM teacher WHERE teacher_id = ?");
$stmt->bind_param("s", $teacherId);
$stmt->execute();
$teacherCheck = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$teacherCheck) {
    http_response_code(404);
    echo json_encode(["error" => "Teacher not found"]);
    exit;
}

// Get curriculum
$curriculumId = getCurrentCurriculumId($conn, $department_id);

if (!$curriculumId) {
    echo json_encode(["error" => "Curriculum not found"]);
    exit;
}

// Get course
$stmt = $conn->prepare("
    SELECT c.id 
    FROM course c
    LEFT JOIN curriculum_courses cr 
    ON c.id = cr.course_id AND cr.curriculum_id = ?
    WHERE c.course_code = ?
");
$stmt->bind_param("is", $curriculumId, $courseCode);
$stmt->execute();
$result = $stmt->get_result();
$course = $result->fetch_assoc();
$stmt->close();

if (!$course) {
    http_response_code(404);
    echo json_encode(["error" => "Course not found"]);
    exit;
}

$courseId = $course['id'];

// Get section
$stmt = $conn->prepare("SELECT id FROM section WHERE block = ? AND room = ?");
$stmt->bind_param("ii", $block, $room);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if (!$row) {
    echo json_encode(["error" => "Section not found"]);
    exit;
}

$sectionId = $row['id'];

// Check existing enrollment
$stmt = $conn->prepare("
    SELECT id FROM teachers_enrollment 
    WHERE course_id = ? AND section_id = ?
");
$stmt->bind_param("ii", $courseId, $sectionId);
$stmt->execute();
$result = $stmt->get_result();
$row = $result->fetch_assoc();
$stmt->close();

if ($row) {
    // Update
    $stmt = $conn->prepare("
        UPDATE teachers_enrollment 
        SET teacher_id = ?, course_id = ?, section_id = ?
        WHERE id = ?
    ");
    $stmt->bind_param("siii", $teacherId, $courseId, $sectionId, $row['id']);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Updated and enrolled successfully"
    ]);
} else {
    // Insert
    $stmt = $conn->prepare("
        INSERT INTO teachers_enrollment (teacher_id, course_id, section_id)
        VALUES (?, ?, ?)
    ");
    $stmt->bind_param("sii", $teacherId, $courseId, $sectionId);
    $stmt->execute();
    $stmt->close();

    echo json_encode([
        "success" => true,
        "message" => "Teacher enrolled successfully"
    ]);
}
?>