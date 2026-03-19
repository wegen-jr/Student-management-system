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

switch ($method) {
    case 'GET':
        $search = isset($_GET['search']) ? $_GET['search'] : '';
        if ($search) {
            $stmt = $conn->prepare("SELECT * FROM course WHERE course_name LIKE ? OR course_code LIKE ?");
            $like_search = "%$search%";
            $stmt->bind_param("ss", $like_search, $like_search);
        
            $stmt->execute();
            $result = $stmt->get_result();
            $courses=$result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($courses);
            $stmt->close();
            $conn->close();
            }else{
            $stmt = $conn->prepare("SELECT * FROM course");
            $stmt->execute();
            $result = $stmt->get_result();
            $courses=$result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($courses);
            $stmt->close();
            $conn->close();
        }
        break;
    case 'POST':
    $data = json_decode(file_get_contents("php://input"), true);

    if (!$data || !isset($data['course_name'], $data['course_code'], $data['credit_hour'])) {
        http_response_code(400);
        echo json_encode(["error" => "Invalid input"]);
        exit;
    }

    $course_name = $data['course_name'];
    $course_code = $data['course_code'];
    $credit_hour = (int)$data['credit_hour'];

            try {
                $conn->begin_transaction();

                $stmt = $conn->prepare("INSERT INTO course(course_name, course_code, credit_hour) VALUES (?, ?, ?)");
                $stmt->bind_param("ssi", $course_name, $course_code, $credit_hour);
                $stmt->execute();

                if ($stmt->error) throw new Exception($stmt->error);

                $conn->commit();

                echo json_encode([
                    "success" => true,
                    "message" => "Course created successfully"
                ]);

                $stmt->close();
                $conn->close();

            } catch (Exception $e) {
                $conn->rollback();
                http_response_code(500);
                echo json_encode(["error" => "An error occurred: " . $e->getMessage()]);
            }
            break;
    case 'PUT':
        if ($id) {
            updateCourse($id);
        } else {
            http_response_code(400);
            echo json_encode(["error" => "Course ID is required for update"]);
        }
        break;
   case 'DELETE':
    $id = isset($segments[0]) && is_numeric($segments[0])
        ? (int)$segments[0]
        : null;

    if ($id !== null && $id > 0) {
        try {
            $stmt = $conn->prepare("DELETE FROM course WHERE id = ?");
            $stmt->bind_param("i", $id);
            $stmt->execute();

            if ($stmt->affected_rows > 0) {
                echo json_encode([
                    "success" => true,
                    "message" => "Course deleted successfully"
                ]);
            } else {
                http_response_code(404);
                echo json_encode(["error" => "Course not found"]);
            }

            $stmt->close();
            $conn->close();
        } catch (Exception $e) {
            http_response_code(500);
            echo json_encode([
                "error" => "An error occurred: " . $e->getMessage()
            ]);
        }
    } else {
        http_response_code(400);
        echo json_encode([
            "error" => "Valid course ID is required for deletion"
        ]);
    }
    break;
    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}

?>