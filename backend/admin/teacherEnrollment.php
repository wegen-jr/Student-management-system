<?php
    session_start();
    ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
    // Allow requests from your frontend
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Credentials: true");

    // Handle preflight request
    if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
        http_response_code(200);
        exit;
    }
    require "../config/database.php";
    $timeout = 1800; // 30 minutes

if (isset($_SESSION['last_activity']) && 
    (time() - $_SESSION['last_activity'] > $timeout)) {

    session_unset();
    session_destroy();

    echo json_encode(["error" => "Session expired"]);
    exit;
}

$_SESSION['last_activity'] = time();
$method=$_SERVER['REQUEST_METHOD'];

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
    if($method=='POST'){
        $data=json_decode(file_get_contents('php://input'),true);
        if(!$data || !isset($data['teacherId'], $data['courseCode'], $data['block'], $data['room'], $data['department_id'])){
            http_response_code(400);
            echo json_encode(["error" => "invalid or missing field"]);
            exit;
        }

        $teacherId=$data['teacherId'];
        $courseCode=$data['courseCode'];
        $block=$data['block'];
        $room=$data['room'];
        $department_id=$data['department_id'];

        $currCurriculumId = getCurrentCurriculumId($conn, $department_id);
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
        if (!$course) {
            http_response_code(404);
            echo json_encode(["error" => "Course not found"]);
            exit;
        }
        $courseId = $course['id'];
        $stmt->close();
        
        $stmt=$conn->prepare('select id from section where block=? and room=?  ');
        $stmt->bind_param('ii',$block,$room);
        $stmt->execute();
        $result=$stmt->get_result();
        $row=$result->fetch_assoc();
        $sectionId=$row['id'];
        $stmt->close(); 

        $stmt=$conn->prepare('select id from teachers_enrollment where course_id=? and section_id=?');
        $stmt->bind_param('ii',$courseId,$sectionId);
        $stmt->execute();
        $result=$stmt->get_result();
        $row=$result->fetch_assoc();
        $enrollId=$row['id']??null;
        $stmt->close(); 

            $stmt = $conn->prepare("SELECT * FROM teacher WHERE teacher_id = ?");
            $stmt->bind_param("s", $teacherId);
            $stmt->execute();
            $teacherCheck = $stmt->get_result()->fetch_assoc();
            $stmt->close();
            if (!$teacherCheck) {
                http_response_code(403);
                echo json_encode(["error" => "Teacher does not found"]);
                exit;
            }


        if($enrollId){
            $stmt=$conn->prepare('update teachers_enrollment set teacher_id=?, course_id=?, section_id=? where id=?');
            $stmt->bind_param('siii',$teacherId,$courseId,$sectionId,$enrollId);
            $stmt->execute();
            $stmt->close();
           
             json_encode([
                "success"=>true,
                "message"=>'update and enrolled successfully'
            ]);
        }else{
            $stmt=$conn->prepare('insert into teachers_enrollment (teacher_id, course_id, section_id) values(?,?,?)');
            $stmt->bind_param('sii',$teacherId,$courseId,$sectionId);
            $stmt->execute();
            $stmt->close();

            json_encode([
                "success"=>true,
                "message"=>'teacher enrolled successfully'
            ]);
        }
    }else{
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
    }
?>