<?php

$auth = requireAuth();
$db = getDb();
$search = $_GET['search'] ?? '';

$sql = "SELECT e.*,
        (SELECT COUNT(*) FROM teams t WHERE t.event_id = e.id) as team_count,
        (SELECT COUNT(DISTINCT tm.staff_id) FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE t.event_id = e.id) as staff_count
        FROM events e";
$conditions = [];
$params = [];

if ($search) {
    $conditions[] = "(e.event_name LIKE ? OR e.venue LIKE ?)";
    $params[] = "%$search%";
    $params[] = "%$search%";
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}

$sql .= " ORDER BY e.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);

jsonResponse($stmt->fetchAll());
