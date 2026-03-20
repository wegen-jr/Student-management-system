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

require "../config/database.php";

// Helper: get the current curriculum ID for the logged-in department
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

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$script_name = $_SERVER['SCRIPT_NAME'];
if (strpos($path, $script_name) === 0) {
    $path = substr($path, strlen($script_name));
}
$segments = explode('/', trim($path, '/'));

switch ($method) {
    case 'GET':
        // Get a single course by courseCode (for update)
        if (isset($_GET['courseCode']) && $_GET['courseCode']) {
            $courseCode = $_GET['courseCode'];
            $currCurriculumId = getCurrentCurriculumId($conn, $department_id);
            if (!$currCurriculumId) {
                http_response_code(404);
                echo json_encode(["error" => "No curriculum found for department"]);
                exit;
            }
            $stmt = $conn->prepare("
                SELECT c.id, c.course_name, c.course_code, c.credit_hour, cr.category 
                FROM course c
                LEFT JOIN curriculum_courses cr ON c.id = cr.course_id AND cr.curriculum_id = ?
                WHERE c.course_code = ?
            ");
            $stmt->bind_param("is", $currCurriculumId, $courseCode);
            $stmt->execute();
            $result = $stmt->get_result();
            $course = $result->fetch_assoc();
            echo json_encode(['course' => $course ?: null]);
            $stmt->close();
            exit;
        }

        // Search courses
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        $currCurriculumId = getCurrentCurriculumId($conn, $department_id);
        if (!$currCurriculumId) {
            http_response_code(404);
            echo json_encode(["error" => "No curriculum found for department"]);
            exit;
        }

        if ($search) {
            $stmt = $conn->prepare("
                SELECT DISTINCT c.id, c.course_name, c.course_code, c.credit_hour, cr.category 
                FROM course c
                LEFT JOIN curriculum_courses cr ON c.id = cr.course_id AND cr.curriculum_id = ?
                WHERE c.course_name LIKE ? OR c.course_code LIKE ?
                ORDER BY c.course_name ASC
            ");
            $like_search = "%$search%";
            $stmt->bind_param("iss", $currCurriculumId, $like_search, $like_search);
        } else {
            $stmt = $conn->prepare("
                SELECT c.id, c.course_name, c.course_code, c.credit_hour, cr.category 
                FROM course c
                LEFT JOIN curriculum_courses cr ON c.id = cr.course_id AND cr.curriculum_id = ?
                ORDER BY c.course_name ASC
            ");
            $stmt->bind_param("i", $currCurriculumId);
        }
        $stmt->execute();
        $result = $stmt->get_result();
        $courses = $result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($courses);
        $stmt->close();
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['course_name'], $data['course_code'], $data['credit_hour'], $data['category'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid input"]);
            exit;
        }

        $course_name = trim($data['course_name']);
        $course_code = trim($data['course_code']);
        $credit_hour = (int)$data['credit_hour'];
        $category = $data['category'];

        $currCurriculumId = getCurrentCurriculumId($conn, $department_id);
        if (!$currCurriculumId) {
            http_response_code(404);
            echo json_encode(["error" => "No curriculum found for department"]);
            exit;
        }

        $conn->begin_transaction();
        try {
            // Check if course already exists
            $stmt = $conn->prepare("SELECT id FROM course WHERE course_code = ?");
            $stmt->bind_param("s", $course_code);
            $stmt->execute();
            $result = $stmt->get_result();
            $existing = $result->fetch_assoc();
            $stmt->close();

            if ($existing) {
                $courseId = $existing['id'];
                // Check if this course is already linked to the current curriculum
                $stmt = $conn->prepare("SELECT id FROM curriculum_courses WHERE course_id = ? AND curriculum_id = ?");
                $stmt->bind_param("ii", $courseId, $currCurriculumId);
                $stmt->execute();
                $link = $stmt->get_result()->fetch_assoc();
                $stmt->close();

                if ($link) {
                    // Update the category
                    $stmt = $conn->prepare("UPDATE curriculum_courses SET category = ? WHERE id = ?");
                    $stmt->bind_param("si", $category, $link['id']);
                    $stmt->execute();
                    $stmt->close();
                } else {
                    // Insert new link
                    $stmt = $conn->prepare("INSERT INTO curriculum_courses (curriculum_id, course_id, category) VALUES (?, ?, ?)");
                    $stmt->bind_param("iis", $currCurriculumId, $courseId, $category);
                    $stmt->execute();
                    $stmt->close();
                }
            } else {
                // Insert new course
                $stmt = $conn->prepare("INSERT INTO course (course_name, course_code, credit_hour) VALUES (?, ?, ?)");
                $stmt->bind_param("ssi", $course_name, $course_code, $credit_hour);
                $stmt->execute();
                $courseId = $conn->insert_id;
                $stmt->close();

                // Link to curriculum
                $stmt = $conn->prepare("INSERT INTO curriculum_courses (curriculum_id, course_id, category) VALUES (?, ?, ?)");
                $stmt->bind_param("iis", $currCurriculumId, $courseId, $category);
                $stmt->execute();
                $stmt->close();
            }

            $conn->commit();
            echo json_encode([
                "success" => true,
                "message" => "Course saved successfully"
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "An error occurred: " . $e->getMessage()]);
        }
        break;

    case 'PUT':
        $id = isset($segments[0]) && is_numeric($segments[0]) ? (int)$segments[0] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Valid course ID required"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid data"]);
            exit;
        }

        $course_name = trim($data['course_name'] ?? '');
        $course_code = trim($data['course_code'] ?? '');
        $credit_hour = (int)($data['credit_hour'] ?? 0);
        $category = $data['category'] ?? '';

        if (!$course_name || !$course_code || !$credit_hour || !$category) {
            http_response_code(400);
            echo json_encode(["error" => "Missing fields"]);
            exit;
        }

        $currCurriculumId = getCurrentCurriculumId($conn, $department_id);
        if (!$currCurriculumId) {
            http_response_code(404);
            echo json_encode(["error" => "No curriculum found for department"]);
            exit;
        }

        $conn->begin_transaction();
        try {
            // Update course details
            $stmt = $conn->prepare("UPDATE course SET course_name = ?, course_code = ?, credit_hour = ? WHERE id = ?");
            $stmt->bind_param("ssii", $course_name, $course_code, $credit_hour, $id);
            $stmt->execute();
            $stmt->close();

            // Update or insert curriculum_courses entry
            $stmt = $conn->prepare("SELECT id FROM curriculum_courses WHERE course_id = ? AND curriculum_id = ?");
            $stmt->bind_param("ii", $id, $currCurriculumId);
            $stmt->execute();
            $link = $stmt->get_result()->fetch_assoc();
            $stmt->close();

            if ($link) {
                $stmt = $conn->prepare("UPDATE curriculum_courses SET category = ? WHERE id = ?");
                $stmt->bind_param("si", $category, $link['id']);
                $stmt->execute();
                $stmt->close();
            } else {
                $stmt = $conn->prepare("INSERT INTO curriculum_courses (curriculum_id, course_id, category) VALUES (?, ?, ?)");
                $stmt->bind_param("iis", $currCurriculumId, $id, $category);
                $stmt->execute();
                $stmt->close();
            }

            $conn->commit();
            echo json_encode([
                "success" => true,
                "message" => "Course updated successfully"
            ]);
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
        }
        break;

    case 'DELETE':
        $id = isset($segments[0]) && is_numeric($segments[0]) ? (int)$segments[0] : null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Valid course ID required"]);
            exit;
        }

        $conn->begin_transaction();
        try {
            // Delete related curriculum_courses entries
            $stmt = $conn->prepare("DELETE FROM curriculum_courses WHERE course_id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $stmt->close();

            // Delete the course
            $stmt = $conn->prepare("DELETE FROM course WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $deleted = $stmt->affected_rows > 0;
            $stmt->close();

            if ($deleted) {
                $conn->commit();
                echo json_encode([
                    "success" => true,
                    "message" => "Course deleted successfully"
                ]);
            } else {
                $conn->rollback();
                http_response_code(404);
                echo json_encode(["error" => "Course not found"]);
            }
        } catch (Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Delete failed: " . $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}
?>