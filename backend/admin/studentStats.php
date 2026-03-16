    <?php
    session_start();


    header("Access-Control-Allow-Origin: http://localhost:5173");
    header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Credentials: true");
    require "../config/database.php";
    $response = [];
    /* Students per gender */
    $result = $conn->query("
    SELECT gender, COUNT(*) as total
    FROM users
    where role = 'student'
    GROUP BY gender
    ");
    $response["genderStats"] = $result->fetch_all(MYSQLI_ASSOC);
    /* Students per department */
    $result = $conn->query("
    SELECT department, COUNT(*) as total
    FROM students
    GROUP BY department
    ");
    $response["departmentStats"] = $result->fetch_all(MYSQLI_ASSOC);


    /* Students per year */
    $result = $conn->query("
    SELECT year, COUNT(*) as total
    FROM students
    GROUP BY year
    ");
    $response["yearStats"] = $result->fetch_all(MYSQLI_ASSOC);

    $result= $conn->query("
        select count(*) as total 
        from students
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