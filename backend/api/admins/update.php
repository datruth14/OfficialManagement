<?php

$auth = requireAuth();
if ($auth['role'] === 'super_admin') {
    errorResponse('Program manager is read-only', 403);
}
$id = $GLOBALS['route_id'];

$input = json_decode(file_get_contents('php://input'), true);

$db = getDb();

$stmt = $db->prepare("SELECT * FROM admins WHERE id = ? AND role = 'admin'");
$stmt->execute([$id]);
$admin = $stmt->fetch();

if (!$admin) {
    errorResponse('Admin not found', 404);
}

$fields = [];
$params = [];

foreach (['fullname', 'email', 'phone', 'department', 'status'] as $field) {
    if (isset($input[$field])) {
        $fields[] = "$field = ?";
        $params[] = trim($input[$field]);
    }
}

if (!empty($input['password'])) {
    $fields[] = "password = ?";
    $params[] = password_hash($input['password'], PASSWORD_BCRYPT);
}

if (!empty($fields)) {
    $fields[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $id;
    $db->prepare("UPDATE admins SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
}

$stmt = $db->prepare("SELECT id, fullname, username, email, phone, department, status, role FROM admins WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Admin updated successfully');
