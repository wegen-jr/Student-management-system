<?php
session_start();

header("Access-Control-Allow-Origin: http://localhost:5173");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Credentials: true");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

require "../config/database.php";

$method = $_SERVER['REQUEST_METHOD'];
$department_id = $_SESSION['department_id'] ?? null;

switch ($method) {

       case 'GET':
        $search = $_GET['search'] ?? '';

        if ($search) {
            $stmt = $conn->prepare("
                SELECT r.id, r.block, r.room
                FROM section r
                LEFT JOIN students s ON r.id = s.section_id AND s.department_id = ?
                WHERE r.block LIKE ? OR r.room LIKE ?
                GROUP BY r.id
            ");
            $like = "%$search%";
            $stmt->bind_param('iss', $department_id, $like, $like);
        } else {
            $stmt = $conn->prepare("
                SELECT r.id, r.block, r.room
                FROM section r
                LEFT JOIN students s ON r.id = s.section_id AND s.department_id = ?
                GROUP BY r.id
            ");
            $stmt->bind_param('i', $department_id);
        }

        $stmt->execute();
        $result = $stmt->get_result();
        echo json_encode($result->fetch_all(MYSQLI_ASSOC));
        $stmt->close();
        break;
    // ✅ POST
    case 'POST':
        $data = json_decode(file_get_contents('php://input'), true);

        if (!isset($data['block'], $data['roomNumber'])) {
            echo json_encode(["error" => "Missing fields"]);
            exit;
        }

        $blockNumber = $data['block']; // string
        $roomNumber = (int)$data['roomNumber']; // force integer

        // Check duplicates for same block + room
        $stmt = $conn->prepare("SELECT id FROM section WHERE block=? AND room=?");
        $stmt->bind_param("si", $blockNumber, $roomNumber);
        $stmt->execute();
        $result = $stmt->get_result();

        if($result->num_rows > 0){
            echo json_encode(["error" => "This room already exists in this block"]);
            exit;
        }

        // Insert room
        $stmt = $conn->prepare("INSERT INTO section (block, room) VALUES (?, ?)");
        $stmt->bind_param('si', $blockNumber, $roomNumber);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Room added successfully"
        ]);

        $stmt->close();
        break;
    // ✅ DELETE
    case 'DELETE':
        $id = $_GET['id'] ?? null;

        if (!$id) {
            echo json_encode(["error" => "Missing ID"]);
            exit;
        }

        $stmt = $conn->prepare("DELETE FROM section WHERE id = ?");
        $stmt->bind_param('i', $id);
        $stmt->execute();

        echo json_encode([
            "success" => true,
            "message" => "Room deleted"
        ]);

        $stmt->close();
        break;

    default:
        http_response_code(405);
        echo json_encode(["error" => "Method not allowed"]);
}