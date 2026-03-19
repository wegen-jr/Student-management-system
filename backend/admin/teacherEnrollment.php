<?php
    session_start();
    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Credentials: true");
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

    if($method=='POST'){
        $data=json_decode(file_get_contents('php://input'),true);
        if(!$data || !isset($data['teacherId'], $data['courseCode'], $data['year'], $data['semester'], $data['department_id'])){
            http_response_code(400);
            echo json_encode(["error" => "invalid or missing field"]);
            break;
        }

        $teacherId=$data['teacher'];
        $courseCode=$data['courseCode'];
        $year=$data['year'];
        $semester=$data['semester'];
        $department_id=$data['department_id'];

        $stmt=$conn->prepare('')
    }


?>