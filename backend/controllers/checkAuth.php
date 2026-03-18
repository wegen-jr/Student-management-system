<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if(isset($_SESSION['user_id'])){

    echo json_encode([
        "loggedIn" => true,
        "user" => [
            "id" => $_SESSION['user_id'],
            "email" => $_SESSION['email'],
            "role" => $_SESSION['role'],
            "department_id" => $_SESSION['department_id']
        ]
    ]);

}else{

    echo json_encode([
        "loggedIn" => false
    ]);

}
?>