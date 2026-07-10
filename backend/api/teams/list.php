<?php

$auth = requireAuth();
$db = getDb();
$eventId = $_GET['event_id'] ?? '';

$sql = "SELECT t.*, e.event_name,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
        FROM teams t JOIN events e ON t.event_id = e.id";
$conditions = [];
$params = [];

if ($eventId) {
    $conditions[] = "t.event_id = ?";
    $params[] = (int)$eventId;
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}

$sql .= " ORDER BY t.created_at DESC";

$stmt = $db->prepare($sql);
$stmt->execute($params);

jsonResponse($stmt->fetchAll());
