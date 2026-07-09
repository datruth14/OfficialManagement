<?php

$auth = requireAuth();
$staffId = $GLOBALS['route_id'];
$input = json_decode(file_get_contents('php://input'), true);
$roleIds = $input['role_ids'] ?? [];

$db = getDb();

$sql = "SELECT id FROM staff WHERE id = ?";
$params = [$staffId];
if (!in_array($auth['role'], ['super_admin', 'super_user'])) {
    $sql .= " AND admin_id = ?";
    $params[] = $auth['id'];
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
if (!$stmt->fetch()) {
    errorResponse('Staff not found', 404);
}

foreach ((array)$roleIds as $rid) {
    $db->prepare("INSERT OR IGNORE INTO staff_roles (staff_id, role_id) VALUES (?, ?)")
       ->execute([$staffId, (int)$rid]);
}

successResponse(null, 'Roles assigned successfully');
