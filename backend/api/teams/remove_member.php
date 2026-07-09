<?php

$auth = requireAuth();
$teamId = $GLOBALS['route_team_id'];
$memberId = $GLOBALS['route_member_id'];

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

$db->prepare("DELETE FROM team_members WHERE team_id = ? AND staff_id = ?")
   ->execute([$teamId, $memberId]);

successResponse(null, 'Member removed successfully');
