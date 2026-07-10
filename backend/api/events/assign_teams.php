<?php

$auth = requireAuth();
$eventId = $GLOBALS['route_id'];
$db = getDb();

$sql = "SELECT t.*, (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count FROM teams t WHERE t.event_id = ?";
$params = [$eventId];

$sql .= " ORDER BY t.team_name";
$stmt = $db->prepare($sql);
$stmt->execute($params);

jsonResponse($stmt->fetchAll());
