<?php

$auth = requireAuth();
$staffId = $GLOBALS['route_staff_id'];
$roleId = $GLOBALS['route_role_id'];

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

$db->prepare("DELETE FROM staff_roles WHERE staff_id = ? AND role_id = ?")
   ->execute([$staffId, $roleId]);

successResponse(null, 'Role removed successfully');
