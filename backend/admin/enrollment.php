<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require "../config/database.php";

if ($_SERVER['REQUEST_METHOD'] === 'POST') {

    $data = json_decode(file_get_contents('php://input'), true);

    if (!$data || !isset($data['year'], $data['semester'], $data['department_id'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid or missing fields"]);
        exit;
    }

    $department_id=$_SESSION['department_id'] ?? null;
    $year = (int)$data['year'];
    $semester = (int)$data['semester'];

    $conn->begin_transaction();

    try {
        // 1️⃣ Get curriculum
        $stmt = $conn->prepare("SELECT id FROM curriculum WHERE department_id=? AND year=? AND semester=?");
        $stmt->bind_param("iii", $department_id, $year, $semester);
        $stmt->execute();
        $result = $stmt->get_result();
        $curriculum = $result->fetch_assoc();
        $stmt->close();

        if (!$curriculum) {
            throw new Exception("Curriculum not found");
        }

        $curriculum_id = $curriculum['id'];

        // 2️⃣ Get all courses
        $courses = [];
        $stmt = $conn->prepare("SELECT course_id FROM curriculum_courses WHERE curriculum_id=?");
        $stmt->bind_param("i", $curriculum_id);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $courses[] = $row['course_id'];
        }
        $stmt->close();

        // 3️⃣ Get all students
        $students = [];
        $stmt = $conn->prepare("SELECT student_id FROM students WHERE department_id=? AND year=? AND semister=?");
        $stmt->bind_param("iii", $department_id, $year, $semester);
        $stmt->execute();
        $result = $stmt->get_result();

        while ($row = $result->fetch_assoc()) {
            $students[] = $row['student_id'];
        }
        $stmt->close();

        // 4️⃣ Insert enrollments
        $stmt = $conn->prepare("INSERT INTO enrollment (stud_id, course_id) VALUES (?, ?)");

        foreach ($students as $student_id) {
            foreach ($courses as $course_id) {
                $stmt->bind_param("si", $student_id, $course_id);
                $stmt->execute();
            }
        }

        $stmt->close();

        $conn->commit();

        echo json_encode([
            "success" => true,
            "message" => count($students) . " students enrolled into " . count($courses) . " courses"
        ]);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["error" => $e->getMessage()]);
    }

} else {
    http_response_code(405);
    echo json_encode(["error" => "Method not allowed"]);
}
?>