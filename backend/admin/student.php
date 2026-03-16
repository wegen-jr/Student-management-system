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
    $search = isset($_GET['search']) ? $_GET['search'] : '';
    
    if ($search) {
        $stmt = $conn->prepare("
            SELECT s.student_id, s.section_id, s.department, s.year, s.semister, 
                   u.first_name, u.middle_name, u.last_name, u.email, u.gender
            FROM students s
            JOIN users u ON s.user_id = u.id
            WHERE s.student_id LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ?
        ");

        if (!$stmt) {
            http_response_code(500);
            echo json_encode(["error" => "Database error: " . $conn->error]);
            exit;
        }

        $likeSearch = "%$search%";
        $stmt->bind_param("sss", $likeSearch, $likeSearch, $likeSearch);
        $stmt->execute();
        $result = $stmt->get_result();
        $students = $result->fetch_all(MYSQLI_ASSOC);

        echo json_encode($students); // return all matching rows
        $stmt->close();

    } else {
        // Get all students
        $stmt = $conn->prepare("
            SELECT s.student_id, s.section_id, s.department, s.year, s.semister, 
                   u.first_name, u.middle_name, u.last_name, u.email, u.gender
            FROM students s
            JOIN users u ON s.user_id = u.id
        ");
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
        if (!$data || !isset($data['studentId'], $data['firstName'], $data['middleName'], $data['lastName'], $data['email'], $data['role'],$data['year'],$data['department'],$data['gender'],$data['semester'])) {
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
        $department=$data['department'];
        $year=$data['year'];
        $semester=$data['semester'];
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
                INSERT INTO students (student_id, user_id, section_id, department, year, semister)
                VALUES (?, ?, NULL, ?, ?, ?)
            ");
            $stmt_student->bind_param("sisii", $studentId, $user_id, $department, $year, $semester);
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
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "Student ID required in URL for update"]);
            exit;
        }

        $data = json_decode(file_get_contents("php://input"), true);
        if (!$data) {
            http_response_code(400);
            echo json_encode(["error" => "Invalid JSON"]);
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

            // Update users table
            $userUpdates = [];
            $userParams = [];
            $userTypes = "";
            $fields = ['first_name', 'middle_name', 'last_name', 'email', 'password'];
            foreach ($fields as $field) {
                if (isset($data[$field])) {
                    $userUpdates[] = "$field = ?";
                    $userParams[] = $field === 'password' ? password_hash($data[$field], PASSWORD_BCRYPT) : $data[$field];
                    $userTypes .= "s";
                }
            }

            if (!empty($userUpdates)) {
                $userParams[] = $user_id;
                $userTypes .= "i";
                $stmt = $conn->prepare("UPDATE users SET " . implode(", ", $userUpdates) . " WHERE id = ?");
                $stmt->bind_param($userTypes, ...$userParams);
                $stmt->execute();
                $stmt->close();
            }

            // Update students table (section_id)
            if (isset($data['section_id'])) {
                $stmt = $conn->prepare("UPDATE students SET section_id = ? WHERE student_id = ?");
                $stmt->bind_param("is", $data['section_id'], $id);
                $stmt->execute();
                $stmt->close();
            }

            $conn->commit();
            echo json_encode(["message" => "Student updated successfully"]);

        } catch(Exception $e) {
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