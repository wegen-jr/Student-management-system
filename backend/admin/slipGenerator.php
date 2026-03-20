<?php
session_start();
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
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

$method=$_SERVER['REQUEST_METHOD'];
$department_id=$_SESSION['department_id'] ?? null;

if($method==='GET'){
    if(isset($_GET['studentId']) && $_GET['studentId']){

    }else{
      $stmt = $conn->prepare("
    SELECT 
        s.student_id,
        CONCAT(u.first_name, ' ',u.middle_name,' ', u.last_name) AS full_name,
        s.year,
        s.semister,
        c.course_name,
        c.course_code,
        c.credit_hour,
        cr.category
    FROM students s
    JOIN users u ON s.user_id=u.id
    JOIN enrollment e ON s.student_id = e.stud_id
    JOIN course c ON e.course_id = c.id
    LEFT JOIN curriculum_courses cr 
        ON c.id = cr.course_id
        AND cr.curriculum_id = (
            SELECT id FROM curriculum 
            WHERE department_id = s.department_id
            ORDER BY year DESC, semester DESC LIMIT 1
        )
    ORDER BY s.student_id ASC, c.course_name ASC
");
$stmt->execute();
$result = $stmt->get_result();
$students = $result->fetch_all(MYSQLI_ASSOC); // returns array of all rows
$stmt->close();
echo json_encode($students);
    }
}
?>