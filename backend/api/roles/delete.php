<?php

$auth = requireAuth();
if ($auth['role'] === 'super_admin') {
    errorResponse('Program manager is read-only', 403);
}
$id = $GLOBALS['route_id'];

$db = getDb();

$stmt = $db->prepare("SELECT id FROM roles WHERE id = ?");
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    errorResponse('Role not found', 404);
}

$db->prepare("DELETE FROM staff_roles WHERE role_id = ?")->execute([$id]);
$db->prepare("DELETE FROM roles WHERE id = ?")->execute([$id]);

successResponse(null, 'Role deleted successfully');
