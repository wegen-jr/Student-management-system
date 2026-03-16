<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require "../config/database.php";

$data = json_decode(file_get_contents("php://input"), true);

$email = $data['email'] ?? "";
$password = $data['password'] ?? "";

if (empty($email) || empty($password)) {
    echo json_encode([
        "success" => false,
        "message" => "Email and password are required"
    ]);
    exit();
}

$sql = "SELECT * FROM users WHERE email=?";
$stmt = $conn->prepare($sql);

if (!$stmt) {
    echo json_encode([
        "success" => false,
        "message" => "Database error"
    ]);
    exit();
}

$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {

    $user = $result->fetch_assoc();

    if (password_verify($password, $user['password'])) {

        $_SESSION['user_id'] = $user['id'];
        $_SESSION['email'] = $user['email'];
        $_SESSION['role'] = $user['role'];

        echo json_encode([
            "success" => true,
            "id" => $user['id'],
            "email" => $user['email'],
            "role" => $user['role']
        ]);

    } else {

        echo json_encode([
            "success" => false,
            "message" => "Password incorrect"
        ]);

    }

} else {

    echo json_encode([
        "success" => false,
        "message" => "User not found"
    ]);

}

$stmt->close();
$conn->close();
?>