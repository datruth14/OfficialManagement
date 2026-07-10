<?php

$auth = requireAuth();
$teamId = $GLOBALS['route_id'];

$db = getDb();

$stmt = $db->prepare("SELECT * FROM teams WHERE id = ?");
$stmt->execute([$teamId]);
$team = $stmt->fetch();

if (!$team) {
    errorResponse('Team not found', 404);
}

$stmt = $db->prepare("
    SELECT s.id, s.staff_id, s.firstname, s.lastname, s.email, s.phone, s.gender, s.status,
           GROUP_CONCAT(DISTINCT r.name) as role_names,
           GROUP_CONCAT(DISTINCT r.id) as role_ids
    FROM team_members tm
    JOIN staff s ON tm.staff_id = s.id
    LEFT JOIN staff_roles sr ON s.id = sr.staff_id
    LEFT JOIN roles r ON sr.role_id = r.id
    WHERE tm.team_id = ?
    GROUP BY s.id
");
$stmt->execute([$teamId]);
$members = $stmt->fetchAll();

// Format roles as arrays
foreach ($members as &$member) {
    $roleNames = $member['role_names'] ? explode(',', $member['role_names']) : [];
    $roleIds = $member['role_ids'] ? explode(',', $member['role_ids']) : [];
    $member['roles'] = [];
    for ($i = 0; $i < count($roleNames); $i++) {
        $member['roles'][] = [
            'id' => (int)$roleIds[$i],
            'name' => $roleNames[$i],
        ];
    }
    unset($member['role_names'], $member['role_ids']);
}

jsonResponse(['team' => $team, 'members' => $members]);
