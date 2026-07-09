<?php

requireSuperAdmin();

$search = $_GET['search'] ?? '';
$db = getDb();

if ($search) {
    $stmt = $db->prepare("SELECT id, fullname, username, email, phone, department, status, role, created_at, updated_at
                          FROM admins WHERE role = 'admin' AND (fullname LIKE ? OR username LIKE ? OR email LIKE ?)
                          ORDER BY created_at DESC");
    $like = "%$search%";
    $stmt->execute([$like, $like, $like]);
} else {
    $stmt = $db->query("SELECT id, fullname, username, email, phone, department, status, role, created_at, updated_at
                        FROM admins WHERE role = 'admin' ORDER BY created_at DESC");
}

$admins = $stmt->fetchAll();

// Attach team info for each admin
$teamStmt = $db->prepare("
    SELECT COUNT(DISTINCT t.id) as team_count
    FROM teams t
    JOIN events e ON t.event_id = e.id
    WHERE t.admin_id = ? AND e.status = 'active'
    AND EXISTS (SELECT 1 FROM team_members tm WHERE tm.team_id = t.id)
");
$eventStmt = $db->prepare("
    SELECT COUNT(DISTINCT e.id) as event_count
    FROM events e
    WHERE e.admin_id = ? AND e.status = 'active'
");

foreach ($admins as &$admin) {
    $teamStmt->execute([$admin['id']]);
    $admin['team_count'] = (int)$teamStmt->fetchColumn();

    $eventStmt->execute([$admin['id']]);
    $admin['event_count'] = (int)$eventStmt->fetchColumn();

    $admin['has_teams'] = $admin['team_count'] > 0;
}

jsonResponse($admins);
