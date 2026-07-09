<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];

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

$db->prepare("DELETE FROM staff_roles WHERE staff_id = ?")->execute([$id]);
$db->prepare("DELETE FROM team_members WHERE staff_id = ?")->execute([$id]);
$db->prepare("DELETE FROM staff WHERE id = ?")->execute([$id]);

successResponse(null, 'Staff deleted successfully');
