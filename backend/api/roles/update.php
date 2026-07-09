<?php

$auth = requireAuth();
if ($auth['role'] === 'super_admin') {
    errorResponse('Program manager is read-only', 403);
}
$id = $GLOBALS['route_id'];
$input = json_decode(file_get_contents('php://input'), true);

$db = getDb();

$stmt = $db->prepare("SELECT id FROM roles WHERE id = ?");
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    errorResponse('Role not found', 404);
}

$fields = [];
$params = [];

foreach (['name', 'description'] as $field) {
    if (isset($input[$field])) {
        $fields[] = "$field = ?";
        $params[] = trim($input[$field]);
    }
}

if (!empty($fields)) {
    $params[] = $id;
    $db->prepare("UPDATE roles SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
}

$stmt = $db->prepare("SELECT * FROM roles WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Role updated successfully');
