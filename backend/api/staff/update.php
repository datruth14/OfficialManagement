<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];
$input = json_decode(file_get_contents('php://input'), true);

$db = getDb();

$sql = "SELECT id FROM staff WHERE id = ?";
$params = [$id];
if (!in_array($auth['role'], ['super_admin', 'super_user'])) {
    $sql .= " AND admin_id = ?";
    $params[] = $auth['id'];
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
if (!$stmt->fetch()) {
    errorResponse('Staff not found', 404);
}

$fields = [];
$updateParams = [];

foreach (['firstname', 'lastname', 'email', 'phone', 'address', 'gender', 'status', 'staff_id'] as $field) {
    if (isset($input[$field])) {
        $fields[] = "$field = ?";
        $val = trim((string)$input[$field]);
        $updateParams[] = in_array($field, ['email', 'phone', 'address', 'gender']) && $val === '' ? null : $val;
    }
}

if (!empty($fields)) {
    $fields[] = "updated_at = CURRENT_TIMESTAMP";
    $updateParams[] = $id;
    $db->prepare("UPDATE staff SET " . implode(', ', $fields) . " WHERE id = ?")->execute($updateParams);
}

$stmt = $db->prepare("SELECT * FROM staff WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Staff updated successfully');
