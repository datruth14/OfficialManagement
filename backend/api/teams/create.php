<?php

$auth = requireAuth();
if ($auth['role'] === 'super_admin') {
    errorResponse('Program manager is read-only', 403);
}
$input = json_decode(file_get_contents('php://input'), true);

$teamName = trim($input['team_name'] ?? '');
$eventId = (int)($input['event_id'] ?? 0);

if (!$teamName || !$eventId) {
    errorResponse('Team name and event_id are required');
}

$db = getDb();

// Verify event exists
$stmt = $db->prepare("SELECT e.id FROM events e WHERE e.id = ?");
$stmt->execute([$eventId]);
$event = $stmt->fetch();

if (!$event) {
    errorResponse('Event not found', 404);
}

$stmt = $db->prepare("INSERT INTO teams (team_name, event_id, admin_id) VALUES (?, ?, ?)");
$stmt->execute([$teamName, $eventId, $auth['id']]);

$id = $db->lastInsertId();
$stmt = $db->prepare("SELECT * FROM teams WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Team created successfully');
