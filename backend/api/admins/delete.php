<?php

$auth = requireAuth();
if (!in_array($auth['role'] , ['super_admin', 'super_user'])) {
    errorResponse('Forbidden', 403);
}
$id = $GLOBALS['route_id'];

if ((int)$id === (int)$auth['id']) {
    errorResponse('Cannot delete yourself', 400);
}

$db = getDb();

$stmt = $db->prepare("SELECT id FROM admins WHERE id = ? AND role = 'admin'");
$stmt->execute([$id]);
if (!$stmt->fetch()) {
    errorResponse('Admin not found', 404);
}

$db->prepare("DELETE FROM admins WHERE id = ?")->execute([$id]);

successResponse(null, 'Admin deleted successfully');
