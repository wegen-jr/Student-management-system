<?php
session_start();
header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') exit;

require "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$department_id = $data['department_id'] ?? $_SESSION['department_id'];
$year = (int)($data['year'] ?? 0);
$semester = (int)($data['semester'] ?? 0);

if (!$department_id || !$year || !$semester) {
    http_response_code(400);
    echo json_encode(["error" => "Missing fields"]);
    exit;
}

$conn->begin_transaction();
try {
    // Get curriculum courses
    $stmt = $conn->prepare("SELECT id FROM curriculum WHERE department_id=? AND year=? AND semester=?");
    $stmt->bind_param("iii", $department_id, $year, $semester);
    $stmt->execute();
    $curriculum = $stmt->get_result()->fetch_assoc();
    $stmt->close();

    if (!$curriculum) throw new Exception("Curriculum not found");

    $curriculum_id = $curriculum['id'];

    $stmt = $conn->prepare("SELECT course_id FROM curriculum_courses WHERE curriculum_id=?");
    $stmt->bind_param("i", $curriculum_id);
    $stmt->execute();
    $courses = [];
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) $courses[] = $row['course_id'];
    $stmt->close();

    // Get teachers
    $stmt = $conn->prepare("SELECT teacher_id FROM teachers WHERE department_id=? AND year=? AND semester=?");
    $stmt->bind_param("iii", $department_id, $year, $semester);
    $stmt->execute();
    $teachers = [];
    $result = $stmt->get_result();
    while ($row = $result->fetch_assoc()) $teachers[] = $row['teacher_id'];
    $stmt->close();

    // Insert enrollment
    $stmt = $conn->prepare("INSERT INTO enrollment (stud_id, course_id) VALUES (?, ?)");

    foreach ($teachers as $teacher_id) {
        foreach ($courses as $course_id) {
            $stmt->bind_param("ii", $teacher_id, $course_id);
            $stmt->execute();
        }
    }
    $stmt->close();
    $conn->commit();

    echo json_encode([
        "success" => true,
        "message" => count($teachers) . " teachers enrolled into " . count($courses) . " courses"
    ]);
} catch (Exception $e) {
    $conn->rollback();
    http_response_code(500);
    echo json_encode(["error" => $e->getMessage()]);
}
?>