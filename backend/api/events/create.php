<?php

$auth = requireAuth();
$input = json_decode(file_get_contents('php://input'), true);

$eventName = trim($input['event_name'] ?? '');
$description = trim($input['description'] ?? '');
$venue = trim($input['venue'] ?? '');
$eventDate = trim($input['event_date'] ?? '');
$startTime = trim($input['start_time'] ?? '');
$endTime = trim($input['end_time'] ?? '');
$status = trim($input['status'] ?? 'active');

if (!$eventName) {
    errorResponse('Event name is required');
}

$db = getDb();
$stmt = $db->prepare("INSERT INTO events (event_name, description, venue, event_date, start_time, end_time, status, admin_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$eventName, $description, $venue, $eventDate, $startTime, $endTime, $status, $auth['id']]);

$id = $db->lastInsertId();
$stmt = $db->prepare("SELECT * FROM events WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Event created successfully');
