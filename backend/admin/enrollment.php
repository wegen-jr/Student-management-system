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

$department_id = $_SESSION['department_id'] ?? null;
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        if (isset($_GET['studentId']) && $_GET['studentId']) {
            $studentId = $_GET['studentId'];
            $stmt = $conn->prepare("SELECT year, semister FROM students WHERE student_id=? AND department_id=?");
            $stmt->bind_param('si', $studentId, $department_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $student = $result->fetch_assoc();
            echo json_encode(['student' => $student ?: null]);
            $stmt->close();
        } else {
            // Optional: handle GET without studentId (e.g., list all students)
            http_response_code(400);
            echo json_encode(["error" => "Missing studentId"]);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (!$data || !isset($data['year'], $data['semester'], $data['block'], $data['room'], $data['department_id'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or missing fields"]);
            exit;
        }

        $year = (int)$data['year'];
        $semester = (int)$data['semester'];
        $block = $data['block'];
        $room = (int)$data['room'];

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

            // 4️⃣ Get section ID
            $stmt = $conn->prepare("SELECT id FROM section WHERE block=? AND room=?");
            $stmt->bind_param('si', $block, $room);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            if (!$row) {
                throw new Exception("Section not found");
            }
            $section_id = $row['id'];
            $stmt->close();

            // 5️⃣ Insert enrollments
            $stmt = $conn->prepare("INSERT INTO enrollment (stud_id, course_id) VALUES (?, ?)");
            foreach ($students as $student_id) {
                foreach ($courses as $course_id) {
                    $stmt->bind_param("si", $student_id, $course_id);
                    $stmt->execute();
                }
            }
            $stmt->close();

            // 6️⃣ Update students' section
            $stmt = $conn->prepare("UPDATE students SET section_id=? WHERE department_id=? AND year=? AND semister=?");
            $stmt->bind_param('iiii', $section_id, $department_id, $year, $semester);
            $stmt->execute();
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
        break;

    case 'PUT':

        parse_str($_SERVER['QUERY_STRING'], $query);
        $studentId = $query['studentId'] ?? null;

        $data = json_decode(file_get_contents("php://input"), true);

        if (!$studentId) {
            http_response_code(400);
            echo json_encode(["error" => "studentId is required"]);
            exit;
        }

        if (
            !$data ||
            !isset($data['year'], $data['semester'], $data['block'], $data['room'], $data['department_id'])
        ) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or missing fields"]);
            exit;
        }

        $year = (int)$data['year'];
        $semester = (int)$data['semester'];
        $block = $data['block'];
        $room = (int)$data['room'];

        $conn->begin_transaction();

        try {

            // 1️⃣ Get section
            $stmt = $conn->prepare("select id from section where block=? and room=?");
            $stmt->bind_param("si", $block, $room);
            $stmt->execute();

            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $section_id = $row['id'] ?? null;
            $stmt->close();

            if (!$section_id) {
                throw new Exception("Section not found");
            }

            // 2️⃣ Update ONLY this student
            $stmt = $conn->prepare("UPDATE students SET year=?, semister=?, section_id=? WHERE student_id=? AND department_id=?");
            $stmt->bind_param("iiisi", $year, $semester, $section_id, $studentId, $department_id);
            $stmt->execute();
            $stmt->close();

            // 3️⃣ Optional: reset enrollment for this student (clean update)
            $stmt = $conn->prepare("DELETE FROM enrollment WHERE stud_id=?");
            $stmt->bind_param("s", $studentId);
            $stmt->execute();
            $stmt->close();

            // 4️⃣ Re-insert courses for this student
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

            $courses = [];
            $stmt = $conn->prepare("SELECT course_id FROM curriculum_courses WHERE curriculum_id=?");
            $stmt->bind_param("i", $curriculum_id);
            $stmt->execute();
            $result = $stmt->get_result();

            while ($row = $result->fetch_assoc()) {
                $courses[] = $row['course_id'];
            }
            $stmt->close();

            $stmt = $conn->prepare("INSERT INTO enrollment (stud_id, course_id) VALUES (?, ?)");

            foreach ($courses as $course_id) {
                $stmt->bind_param("si", $studentId, $course_id);
                $stmt->execute();
            }

            $stmt->close();

            $conn->commit();

            echo json_encode([
                "success" => true,
                "message" => "Student updated and re-enrolled successfully"
            ]);

        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => $e->getMessage()]);
        }

        break;

    case 'DELETE':
        // Optional: handle DELETE if needed
        http_response_code(405);
        echo json_encode(["error" => "DELETE method not implemented"]);
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}