<?php

$auth = requireAuth();
$db = getDb();

$search = $_GET['search'] ?? '';
$roleId = $_GET['role_id'] ?? '';
$eventId = $_GET['event_id'] ?? '';

$sql = "SELECT DISTINCT s.* FROM staff s";
$conditions = [];
$params = [];

if ($search) {
    $conditions[] = "(s.firstname LIKE ? OR s.lastname LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.staff_id LIKE ?)";
    $like = "%$search%";
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
    $params[] = $like;
}

if ($roleId) {
    $conditions[] = "s.id IN (SELECT staff_id FROM staff_roles WHERE role_id = ?)";
    $params[] = (int)$roleId;
}

if ($eventId) {
    $conditions[] = "s.id IN (SELECT tm.staff_id FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE t.event_id = ?)";
    $params[] = (int)$eventId;
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}

$sql .= " ORDER BY s.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);
$staffList = $stmt->fetchAll();

// Fetch roles and teams for each staff member
foreach ($staffList as &$staff) {
    $rs = $db->prepare("SELECT r.id, r.name, r.description FROM roles r
                        JOIN staff_roles sr ON r.id = sr.role_id WHERE sr.staff_id = ?");
    $rs->execute([$staff['id']]);
    $staff['roles'] = $rs->fetchAll();

    $ts = $db->prepare("SELECT t.id, t.team_name, t.event_id, e.event_name FROM teams t
                        JOIN team_members tm ON t.id = tm.team_id
                        JOIN events e ON t.event_id = e.id
                        WHERE tm.staff_id = ?");
    $ts->execute([$staff['id']]);
    $staff['teams'] = $ts->fetchAll();
}

jsonResponse($staffList);
