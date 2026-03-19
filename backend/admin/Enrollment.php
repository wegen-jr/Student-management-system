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

    if($method=='POST'){
        $data=json_decode(file_get_contents('php://input'),true);
        if(!$data || !isset($data['year'], $data['semester'], $data['department_id'])){
            http_response_code(400);
           echo json_encode(["error" => "invalid or missing fields"]);
        }
        $department_id=$data['department_id'];
        $year=$data['year'];
        $semester=$data['semester'];

        mysqli_begin_transaction();
        try{
            $stmt = $conn->prepare("SELECT id FROM curriculum WHERE department_id=?");
            $stmt->bind_param("i", $department_id);
            $stmt->execute();
            $result = $stmt->get_result();
            $row = $result->fetch_assoc();
            $curriculum_id = $row['id'] ?? null;
            $stmt->close();

            $stmt=$conn->prepare("selct course_id from curriculum_courses where curriculum_id=?");
            $stmt->bind_params('i',$curriculum_id);
            $stmt->execute();
            $result=$stmt->get_result();
            $row=$result->fetch_assoc();
            $course_id=$row["course_id"]?? null;
            $stmt->close();

            $stmt=$conn->prepare("select student_id from students where department_id=? and year=? and semister=?");
            $stmt->bind_params('iii',$department_id,$year,$semester);
            $stmt->execute();
            $result=$stmt->get_result();
            $row=$result->fetch_assoc();
            $student_id=$row["student_id"]?? null;
            $stmt->close();


            $stmt=$conn->prepare("insert department_id , year, semester into enrollment where department_id=? and year=? and semister=?");
            $stmt->bind_params('iii',$department_id,$year,$semester);
            $stmt->execute();
            $result=$stmt->get_result();
            $row=$result->fetch_assoc();
            $student_id=$row["student_id"]?? null;
            $stmt->close();
        } catch(Exception $e) {
            $conn->rollback();
            http_response_code(500);
            echo json_encode(["error" => "Registration failed: " . $e->getMessage()]);
            exit;
        }
    }else{
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
?>