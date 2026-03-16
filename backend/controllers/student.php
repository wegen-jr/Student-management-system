<?php
header("Content-Type: application/json");
require "config/database.php"; // use require for critical files

// Get the HTTP method and path
$method = $_SERVER['REQUEST_METHOD'];
// For GET requests with query string like ?id=1, you can also use $_GET['id']
// But a RESTful way is to use path segments: /students/1
$request_uri = $_SERVER['REQUEST_URI'];
$path = parse_url($request_uri, PHP_URL_PATH);
$path = str_replace('/backend/students', '', $path); // adjust base path
$segments = explode('/', trim($path, '/'));
$id = isset($segments[0]) && is_numeric($segments[0]) ? (int)$segments[0] : null;

// Handle different methods
switch ($method) {
    case 'GET':
        if ($id) {
            // Get single student
            $stmt = $conn->prepare("SELECT * FROM students WHERE student_id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();
            $result = $stmt->get_result();
            $student = $result->fetch_assoc();
            if ($student) {
                echo json_encode($student);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Student not found"]);
            }
            $stmt->close();
        } else {
            // Get all students
            $result = $conn->query("SELECT * FROM students");
            $students = $result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($students);
        }
        break;

    case 'POST':
        // Create a new student
        $data = json_decode(file_get_contents("php://input"), true);
        if (!isset($data['name'], $data['email'])) {
            http_response_code(400);
            echo json_encode(["error" => "Missing required fields"]);
            break;
        }
        $stmt = $conn->prepare("INSERT INTO students (name, email) VALUES (?, ?)");
        $stmt->bind_param("ss", $data['name'], $data['email']);
        if ($stmt->execute()) {
            http_response_code(201);
            echo json_encode(["id" => $conn->insert_id, "name" => $data['name'], "email" => $data['email']]);
        } else {
            http_response_code(500);
            echo json_encode(["error" => "Failed to create student"]);
        }
        $stmt->close();
        break;

    case 'PUT':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            break;
        }
        $data = json_decode(file_get_contents("php://input"), true);
        // Build dynamic update (only provided fields)
        $updates = [];
        $params = [];
        $types = "";
        if (isset($data['name'])) {
            $updates[] = "name = ?";
            $params[] = $data['name'];
            $types .= "s";
        }
        if (isset($data['email'])) {
            $updates[] = "email = ?";
            $params[] = $data['email'];
            $types .= "s";
        }
        if (empty($updates)) {
            http_response_code(400);
            echo json_encode(["error" => "No fields to update"]);
            break;
        }
        $params[] = $id;
        $types .= "i";
        $sql = "UPDATE students SET " . implode(", ", $updates) . " WHERE id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            echo json_encode(["success" => true]);
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Student not found or no changes"]);
        }
        $stmt->close();
        break;

    case 'DELETE':
        if (!$id) {
            http_response_code(400);
            echo json_encode(["error" => "ID required"]);
            break;
        }
        $stmt = $conn->prepare("DELETE FROM students WHERE id = ?");
        $stmt->bind_param("i", $id);
        if ($stmt->execute() && $stmt->affected_rows > 0) {
            http_response_code(204); // No content
        } else {
            http_response_code(404);
            echo json_encode(["error" => "Student not found"]);
        }
        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
        break;
}

$conn->close();
?>