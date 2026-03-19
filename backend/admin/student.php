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

if (isset($_SESSION['last_activity']) && 
    (time() - $_SESSION['last_activity'] > $timeout)) {

    session_unset();
    session_destroy();

    echo json_encode(["error" => "Session expired"]);
    exit;
}

$_SESSION['last_activity'] = time();

require "../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);

// Get the script's own path
$script_name = $_SERVER['SCRIPT_NAME'];
if (strpos($path, $script_name) === 0) {
    $path = substr($path, strlen($script_name));
}

$segments = explode('/', trim($path, '/'));
$id = !empty($segments[0]) ? $segments[0] : null;

switch ($method) {

        // ============================
    case 'GET':
        $department_id=$_SESSION['department_id'] ?? null;
        if (isset($_GET['studentId']) && $_GET['studentId'] !== "") {
        $studentId = $_GET['studentId'];

        $stmt = $conn->prepare("
            SELECT s.student_id, s.section_id, s.department_id, d.name AS department_name, s.year, s.semister,
                   u.first_name, u.middle_name, u.last_name, u.email, u.gender
            FROM students s
            JOIN users u ON s.user_id = u.id
            JOIN departments d ON s.department_id = d.id
            WHERE s.student_id = ?
        ");
        $stmt->bind_param("s", $studentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $student = $result->fetch_assoc();

        echo json_encode(["student" => $student ?: null]);
        $stmt->close();
        exit();
    }
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        
        if ($search) {
            $stmt = $conn->prepare("
                SELECT s.student_id, s.section_id, s.department_id, d.name, s.year, s.semister, 
                    u.first_name, u.middle_name, u.last_name, u.email, u.gender
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN departments d ON s.department_id = d.id
                WHERE s.department_id=? and (s.student_id LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?)
            ");

            if (!$stmt) {
                http_response_code(500);
                echo json_encode(["error" => "Database error: " . $conn->error]);
                exit;
            }

            $likeSearch = "%$search%";
            $stmt->bind_param("isss",$department_id ,$likeSearch, $likeSearch, $likeSearch);
            $stmt->execute();
            $result = $stmt->get_result();
            $students = $result->fetch_all(MYSQLI_ASSOC);

            echo json_encode($students); // return all matching rows
            $stmt->close();

        } else {
            // Get all students
            $stmt = $conn->prepare("
                SELECT s.student_id, s.section_id, s.department_id, d.name, s.year, s.semister, 
                    u.first_name, u.middle_name, u.last_name, u.email, u.gender
                FROM students s
                JOIN users u ON s.user_id = u.id
                JOIN departments d ON s.department_id = d.id
                where s.department_id=?
            ");
            $stmt->bind_param("i", $department_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $students = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($students);
            $stmt->close();
        }
        break;

    // ============================
    case 'POST':
        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data || !isset($data['studentId'], $data['firstName'], $data['middleName'], $data['lastName'], $data['email'], $data['role'],$data['year'],$data['department_id'],$data['gender'],$data['semister'])) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid or missing fields"]);
            break;
        }
        $studentId = $data['studentId'];
        $firstName = $data['firstName'];
        $middleName = $data['middleName'];
        $lastName = $data['lastName'];
        $email = $data['email'];
        $gender=$data['gender'];
        $department=$data['department_id'];
        $year=$data['year'];
        $semester=$data['semister'];
        $role = $data['role'];

       $conn->begin_transaction();
        try {
            // 1️⃣ Insert into users
            $stmt_user = $conn->prepare("INSERT INTO users (first_name, middle_name, last_name, email, role, gender) VALUES (?, ?, ?, ?, ?, ?)");
            $stmt_user->bind_param("ssssss", $firstName, $middleName, $lastName, $email, $role, $gender);
            $stmt_user->execute();
            if($stmt_user->error) throw new Exception($stmt_user->error);
            $user_id = $conn->insert_id;

            // 2️⃣ Insert into students
            $stmt_student = $conn->prepare("
                INSERT INTO students (student_id, user_id, section_id, department_id, year, semister)
                VALUES (?, ?, NULL, ?, ?, ?)
            ");
            $stmt_student->bind_param("siiii", $studentId, $user_id, $department, $year, $semister);
            $stmt_student->execute();
            if($stmt_student->error) throw new Exception($stmt_student->error);

            $conn->commit();

            echo json_encode([
                "success" => true,
                "message" => "Student registered successfully",
            ]);

            $stmt_user->close();
            $stmt_student->close();
            exit;
        } catch(Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
            exit;
        }
        break;

    // ============================
 case 'PUT':
    $data = json_decode(file_get_contents("php://input"), true);
    $studentId = $data['studentId'] ?? null; // Student ID from JSON

    if (!$studentId) {
        http_response_code(400);
        echo json_encode(["error" => "Student ID required for update"]);
        exit;
    }

    $conn->begin_transaction();
    try {
        // 1️⃣ Get user_id for the student
        $stmt = $conn->prepare("SELECT user_id FROM students WHERE student_id = ?");
        $stmt->bind_param("s", $studentId);
        $stmt->execute();
        $result = $stmt->get_result();
        $student = $result->fetch_assoc();
        if (!$student) {
            http_response_code(404);
            echo json_encode(["error" => "Student not found"]);
            exit;
        }
        $user_id = $student['user_id'];
        $stmt->close();

        // 2️⃣ Update users table
        $userFields = ['first_name', 'middle_name', 'last_name', 'email', 'gender'];
        $updates = [];
        $params = [];
        $types = "";

        foreach ($userFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                $params[] = $data[$field];
                $types .= "s"; // all user fields are strings
            }
        }

        if (!empty($updates)) {
            $params[] = $user_id;
            $types .= "i"; // user_id is integer
            $stmt = $conn->prepare("UPDATE users SET " . implode(", ", $updates) . " WHERE id = ?");
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $stmt->close();
        }

        // 3️⃣ Update students table
        $studentFields = ['year', 'semister', 'department_id', 'section_id'];
        $updates = [];
        $params = [];
        $types = "";

        foreach ($studentFields as $field) {
            if (isset($data[$field])) {
                $updates[] = "$field = ?";
                // Use integer type for these fields
                $types .= "i";
                $params[] = (int)$data[$field];
            }
        }

        if (!empty($updates)) {
            $params[] = $studentId; // for WHERE clause
            $types .= "s"; // student_id is string
            $stmt = $conn->prepare("UPDATE students SET " . implode(", ", $updates) . " WHERE student_id = ?");
            $stmt->bind_param($types, ...$params);
            $stmt->execute();
            $stmt->close();
        }

        $conn->commit();
        echo json_encode(["success" => true, "message" => "Student updated successfully"]);

    } catch (Exception $e) {
        $conn->rollback();
        http_response_code(500);
        echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
    }
    break;
    // ============================
    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Student ID required in URL for delete"]);
            exit;
        }

        $conn->begin_transaction();
        try {
            // Get user_id
            $stmt = $conn->prepare("SELECT user_id FROM students WHERE student_id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $student = $result->fetch_assoc();
            if (!$student) {
                http_response_code(404);
                echo json_encode(["error" => "Student not found"]);
                exit;
            }
            $user_id = $student['user_id'];
            $stmt->close();

            // Delete student
            $stmt = $conn->prepare("DELETE FROM students WHERE student_id = ?");
            $stmt->bind_param("s", $id);
            $stmt->execute();
            $stmt->close();

            // Delete user
            $stmt = $conn->prepare("DELETE FROM users WHERE id = ?");
            $stmt->bind_param("i", $user_id);
            $stmt->execute();
            $stmt->close();

            $conn->commit();
            http_response_code(204); // No content

        } catch(Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Delete failed: " . $e->getMessage()]);
        }
        break;

    // ============================
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

$conn->close();
?>