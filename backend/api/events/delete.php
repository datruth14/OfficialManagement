<?php

$auth = requireAuth();
$id = $GLOBALS['route_id'];

$db = getDb();

$stmt = $db->prepare("SELECT id FROM events WHERE id = ?");
$stmt->execute([$id]);
$event = $stmt->fetch();
if (!$event) {
    errorResponse('Event not found', 404);
}

$db->prepare("DELETE FROM events WHERE id = ?")->execute([$id]);

successResponse(null, 'Event deleted successfully');
