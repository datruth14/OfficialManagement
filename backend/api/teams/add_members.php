<?php

$auth = requireAuth();
$teamId = $GLOBALS['route_id'];
$input = json_decode(file_get_contents('php://input'), true);
$staffIds = $input['staff_ids'] ?? [];

$db = getDb();

$stmt = $db->prepare("SELECT * FROM teams WHERE id = ?");
$stmt->execute([$teamId]);
$team = $stmt->fetch();

if (!$team) {
    errorResponse('Team not found', 404);
}

if (!in_array($auth['role'], ['super_admin', 'super_user']) && (int)$team['admin_id'] !== (int)$auth['id']) {
    errorResponse('Forbidden', 403);
}

foreach ((array)$staffIds as $sid) {
    $db->prepare("INSERT OR IGNORE INTO team_members (team_id, staff_id) VALUES (?, ?)")
       ->execute([$teamId, (int)$sid]);
}

successResponse(null, 'Members added successfully');
