<?php

requireSuperAdmin();
$db = getDb();

$totalAdmins = $db->query("SELECT COUNT(*) as cnt FROM admins WHERE role = 'admin'")->fetch()['cnt'];
$totalStaff = $db->query("SELECT COUNT(*) as cnt FROM staff")->fetch()['cnt'];
$totalEvents = $db->query("SELECT COUNT(*) as cnt FROM events")->fetch()['cnt'];
$totalRoles = $db->query("SELECT COUNT(*) as cnt FROM roles")->fetch()['cnt'];
$activeTeams = $db->query("SELECT COUNT(*) as cnt FROM teams")->fetch()['cnt'];

$staffPerEvent = $db->query("
    SELECT e.event_name, COUNT(DISTINCT tm.staff_id) as count
    FROM events e
    LEFT JOIN teams t ON e.id = t.event_id
    LEFT JOIN team_members tm ON t.id = tm.team_id
    GROUP BY e.id ORDER BY e.created_at DESC LIMIT 10
")->fetchAll();

$staffPerRole = $db->query("
    SELECT r.name, COUNT(sr.staff_id) as count
    FROM roles r LEFT JOIN staff_roles sr ON r.id = sr.role_id
    GROUP BY r.id ORDER BY count DESC
")->fetchAll();

$eventsCreated = $db->query("
    SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count
    FROM events GROUP BY month ORDER BY month ASC LIMIT 12
")->fetchAll();

$teamDistribution = $db->query("
    SELECT e.event_name, COUNT(t.id) as count
    FROM events e LEFT JOIN teams t ON e.id = t.event_id
    GROUP BY e.id ORDER BY count DESC LIMIT 10
")->fetchAll();

$recentAdmins = $db->query("
    SELECT id, fullname, username, email, status, created_at
    FROM admins WHERE role = 'admin' ORDER BY created_at DESC LIMIT 5
")->fetchAll();

$recentEvent = $db->query("
    SELECT e.*,
        (SELECT COUNT(*) FROM teams t WHERE t.event_id = e.id) as team_count,
        (SELECT COUNT(DISTINCT tm.staff_id) FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE t.event_id = e.id) as staff_count
    FROM events e ORDER BY e.created_at DESC LIMIT 1
")->fetch();

if ($recentEvent) {
    $recentEventTeams = $db->prepare("
        SELECT t.*, (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
        FROM teams t WHERE t.event_id = ? ORDER BY t.created_at DESC
    ");
    $recentEventTeams->execute([$recentEvent['id']]);
    $recentEvent['teams'] = $recentEventTeams->fetchAll();
}

jsonResponse([
    'cards' => [
        'totalAdmins' => (int)$totalAdmins,
        'totalStaff' => (int)$totalStaff,
        'totalEvents' => (int)$totalEvents,
        'totalRoles' => (int)$totalRoles,
        'activeTeams' => (int)$activeTeams,
    ],
    'charts' => [
        'staffPerEvent' => $staffPerEvent,
        'staffPerRole' => $staffPerRole,
        'eventsCreated' => $eventsCreated,
        'teamDistribution' => $teamDistribution,
    ],
    'recentAdmins' => $recentAdmins,
    'recentEvent' => $recentEvent,
]);
