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
    
    $response = [];
    if (!isset($_SESSION['department_id'])) {
    echo json_encode(["error" => "Unauthorized"]);
    exit();
}
    $department_id = $_SESSION['department_id'];

    /* Students per gender */
    $result = $conn->query("
        SELECT u.gender, COUNT(*) as total
        FROM users u
        INNER JOIN students s ON u.id = s.user_id
        WHERE s.department_id = $department_id
        AND u.role = 'student'
        GROUP BY u.gender");
    $response["genderStats"] = $result->fetch_all(MYSQLI_ASSOC);

    /* Students per year */
    $result = $conn->query("
    SELECT year, COUNT(*) as total
    FROM students
    GROUP BY year
    ");
    $response["yearStats"] = $result->fetch_all(MYSQLI_ASSOC);

    $result= $conn->query("
        select count(*) as total 
        from students where department_id = $department_id
    ");
    $response["totalStudents"] = $result->fetch_assoc()["total"];

    $result= $conn->query("
        select count(*) as total 
        from teacher
    ");
    $response["totalTeachers"] = $result->fetch_assoc()["total"];  

    $result= $conn->query("
        select count(*) as total 
        from course
    ");
    $response["totalCourses"] = $result->fetch_assoc()["total"];

    $result= $conn->query("
        select count(*) as total 
        from section
    ");
    $response["totalSections"] = $result->fetch_assoc()["total"];
    echo json_encode($response);
    ?>