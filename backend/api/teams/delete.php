<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];

$db = getDb();

$stmt = $db->prepare("SELECT * FROM teams WHERE id = ?");
$stmt->execute([$id]);
$team = $stmt->fetch();

if (!$team) {
    errorResponse('Team not found', 404);
}

if (!in_array($auth['role'], ['super_admin', 'super_user']) && (int)$team['admin_id'] !== (int)$auth['id']) {
    errorResponse('Forbidden', 403);
}

$db->prepare("DELETE FROM teams WHERE id = ?")->execute([$id]);

successResponse(null, 'Team deleted successfully');
