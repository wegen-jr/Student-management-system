<?php
session_start();
        header("Access-Control-Allow-Origin: http://localhost:5173");
        header("Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE");
        header("Access-Control-Allow-Headers: Content-Type");
        header("Access-Control-Allow-Credentials: true");
    require "../config/database.php";

    $method=$_SERVER['REQUEST_METHOD'];
    $request_uri=$_SERVER['REQUEST_URI'];
    $path=parse_url($request_uri,PHP_URL_PATH);
    $script_name=$_SERVER['SCRIPT_NAME'];
    if(strpos($path,$script_name)===0){
        $path=substr($path,strlen($script_name));
    }
    $segment=explode('/',trim($path,'/'));
    $id=!empty($segment[0])? $segment[0]:null;

    switch($method){
       // ============================
    case 'GET':
        $department_id=$_SESSION['department_id'] ?? null;
        if (isset($_GET['teacherId']) && $_GET['teacherId'] !== "") {
        $teacherId = $_GET['teacherId'];
        $stmt = $conn->prepare("
            SELECT t.teacher_id, t.education_level, t.department_id, d.name AS department_name, t.experience, t.specialization,t.office_number, t.phone_number,
            u.first_name, u.middle_name, u.last_name, u.email, u.gender
            FROM teacher t
            JOIN users u ON t.user_id = u.id
            JOIN departments d ON t.department_id = d.id
            WHERE t.teacher_id = ?
        ");
        $stmt->bind_param("s", $teacherId);
        $stmt->execute();
        $result = $stmt->get_result();
        $teacher=$result->fetch_assoc();
        if($teacher){
            echo json_encode(["teacher"=>$teacher]);
        }else{
            http_response_code(404);
            echo json_encode(["error"=>"Teacher not found"]);
        }
        $stmt->close();
        exit();
    }
        $search=isset($_GET['search'])? $_GET['search']:"";
        if($search){
        $stmt=$conn->prepare("
                SELECT t.teacher_id, t.education_level, t.specialization, t.experience, u.first_name,d.name, 
                u.middle_name, u.last_name, u.email, u.gender, t.office_number, t.phone_number
                FROM teacher t
                JOIN users u ON t.user_id = u.id
                JOIN departments d ON t.department_id = d.id
                WHERE u.first_name LIKE ? OR u.last_name LIKE ? OR t.teacher_id LIKE ?"
            );
                
                if (!$stmt) {
                http_response_code(500);
                echo json_encode(["error" => "Database error: " . $conn->error]);
                exit;
            }
        $like_search="%$search%";
        $stmt->bind_param("sss",$like_search,$like_search,$like_search);
        $stmt->execute();
        $result=$stmt->get_result();
        $teachers=$result->fetch_all(MYSQLI_ASSOC);
        echo json_encode($teachers);
        $stmt->close();
        exit(); 

        }else{
        $stmt=$conn->prepare("
                SELECT t.teacher_id,t.education_level, t.department_id, d.name ,t.specialization, t.experience,
                u.first_name, u.middle_name, u.last_name, u.email, u.gender, t.office_number, t.phone_number
                FROM teacher t
                JOIN users u ON t.user_id = u.id
                JOIN departments d ON t.department_id = d.id"
            );
            $stmt->execute();
            $result=$stmt->get_result();
            $teachers=$result->fetch_all(MYSQLI_ASSOC);
            echo json_encode($teachers);
            $stmt->close();
        }
        break;
        case 'POST':
            $data=json_decode(file_get_contents("php://input"),true);
            if(!$data || !isset($data['firstName'], $data['middleName'] ,$data['lastName'], $data['email'], $data['department_id'], $data['specialization'], $data['qualification'], $data['experience'], $data['officeNumber'], $data['role'],$data['teacherId'] , $data['gender'], $data['phone'])){
                http_response_code(400);
                echo json_encode(["error"=>"Missing required fields"]);
                exit();
            }
            $first_name=$data['firstName'];
            $middle_name=$data['middleName'];
            $last_name=$data['lastName'];
            $email=$data['email'];
            $department_id=$data['department_id'];
            $specialization=$data['specialization'];
            $qualification=$data['qualification'];
            $experience=$data['experience'];
            $office_number=$data['officeNumber'];
            $role=$data['role'];
            $teacher_id=$data['teacherId'];
            $gender=$data['gender'];
            $phone=$data['phone'];

            $conn->begin_transaction();
            try{
                $stmt_user=$conn->prepare("INSERT INTO users (first_name, middle_name, last_name, email, role, gender) VALUES (?, ?, ?, ?, ?, ?)");
                $stmt_user->bind_param("ssssss", $first_name, $middle_name, $last_name, $email, $role, $gender);
                $stmt_user->execute();
                if($stmt_user->error) throw new Exception($stmt_user->error);
                $user_id=$stmt_user->insert_id;
                //insert into teachers table
                $stmt_teacher=$conn->prepare("INSERT INTO teacher (teacher_id, user_id, department_id, specialization, education_level, experience, office_number,phone_number) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
                $stmt_teacher->bind_param("siissiii", $teacher_id, $user_id, $department_id, $specialization, $qualification, $experience, $office_number, $phone);
                $stmt_teacher->execute();
                if($stmt_teacher->error) throw new Exception($stmt_teacher->error);
                $conn->commit();    
                    
                    echo json_encode([
                    "success" => true,
                    "message" => "Teacher registered successfully",
                ]);

                $stmt_user->close();
                $stmt_student->close();
                exit;
             }catch(Exception $e){
                    $conn->rollback();
                    http_response_code(500);
                    echo json_encode(["error"=>"Failed to register teacher: " . $e->getMessage()]);
                    exit();
                }
             break;
        case 'PUT':
             $data = json_decode(file_get_contents("php://input"), true);
            $teacherId = $data['teacherId'] ?? null; // teacher ID from JSON

            if (!$teacherId) {
                http_response_code(400);
                echo json_encode(["error" => "teacher ID required for update"]);
                exit;
            }

            $conn->begin_transaction();
            try {
                // 1️⃣ Get user_id for the student
                $stmt = $conn->prepare("SELECT user_id FROM teacher WHERE teacher_id = ?");
                $stmt->bind_param("s", $teacherId);
                $stmt->execute();
                $result = $stmt->get_result();
                $teacher = $result->fetch_assoc();
                if (!$teacher) {
                    http_response_code(404);
                    echo json_encode(["error" => "teacher not found"]);
                    exit;
                }
                $user_id = $teacher['user_id'];
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

                                // 3️⃣ Update teachers table
                $teacherField = ['education_level', 'specialization', 'department_id', 'phone_number', 'office_number', 'experience'];
                $updates = [];
                $params = [];
                $types = "";
                    foreach ($teacherField as $field) {
                        if (isset($data[$field])) {
                            $updates[] = "$field = ?";

                            if (in_array($field, ['department_id', 'experience'])) {
                                $types .= "i"; // integer
                                $params[] = ($data[$field] === "" ? NULL : (int)$data[$field]);
                            } else {
                                $types .= "s"; // string
                                $params[] = $data[$field];
                            }
                        }
                    }
                if (!empty($updates)) {
                    $params[] = $teacherId; // for WHERE clause
                    $types .= "s"; // student_id is string
                    $stmt = $conn->prepare("UPDATE teacher SET " . implode(", ", $updates) . " WHERE teacher_id = ?");
                    $stmt->bind_param($types, ...$params);
                    $stmt->execute();
                    $stmt->close();
                }

                $conn->commit();
                echo json_encode(["success" => true, "message" => "teacher updated successfully"]);

            } catch (Exception $e) {
                $conn->rollback();
                http_response_code(500);
                echo json_encode(["error" => "Update failed: " . $e->getMessage()]);
            }
            break;


}

?>