<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];
$input = json_decode(file_get_contents('php://input'), true);

$db = getDb();

$stmt = $db->prepare("SELECT id FROM events WHERE id = ?");
$stmt->execute([$id]);
$event = $stmt->fetch();
if (!$event) {
    errorResponse('Event not found', 404);
}

$fields = [];
$params = [];

foreach (['event_name', 'description', 'venue', 'event_date', 'start_time', 'end_time', 'status'] as $field) {
    if (isset($input[$field])) {
        $fields[] = "$field = ?";
        $params[] = trim($input[$field]);
    }
}

if (!empty($fields)) {
    $fields[] = "updated_at = CURRENT_TIMESTAMP";
    $params[] = $id;
    $db->prepare("UPDATE events SET " . implode(', ', $fields) . " WHERE id = ?")->execute($params);
}

$stmt = $db->prepare("SELECT * FROM events WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Event updated successfully');
