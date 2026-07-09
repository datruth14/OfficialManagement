<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];
$input = json_decode(file_get_contents('php://input'), true);

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

$teamName = trim($input['team_name'] ?? '');
if (!$teamName) {
    errorResponse('Team name is required');
}

$db->prepare("UPDATE teams SET team_name = ? WHERE id = ?")
   ->execute([$teamName, $id]);

$stmt = $db->prepare("SELECT * FROM teams WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Team updated successfully');
