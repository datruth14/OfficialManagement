<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];
$db = getDb();

$sql = "SELECT s.* FROM staff s WHERE s.id = ?";
$params = [$id];

if (!in_array($auth['role'], ['super_admin', 'super_user'])) {
    $sql .= " AND s.admin_id = ?";
    $params[] = $auth['id'];
}

$stmt = $db->prepare($sql);
$stmt->execute($params);
$staff = $stmt->fetch();

if (!$staff) {
    errorResponse('Staff not found', 404);
}

$rs = $db->prepare("SELECT r.id, r.name, r.description FROM roles r
                    JOIN staff_roles sr ON r.id = sr.role_id WHERE sr.staff_id = ?");
$rs->execute([$id]);
$staff['roles'] = $rs->fetchAll();

$ts = $db->prepare("SELECT t.id, t.team_name, t.event_id FROM teams t
                    JOIN team_members tm ON t.id = tm.team_id WHERE tm.staff_id = ?");
$ts->execute([$id]);
$staff['teams'] = $ts->fetchAll();

jsonResponse($staff);
