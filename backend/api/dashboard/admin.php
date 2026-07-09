<?php

$auth = requireAuth();
$db = getDb();
$adminId = $auth['id'];

// myEvents: only active events (all events - managers see all)
$myEvents = $db->query("SELECT COUNT(*) as cnt FROM events WHERE status = 'active'");
$myEventsCount = (int)$myEvents->fetch()['cnt'];

// myStaff: only manager's own staff
$myStaff = $db->prepare("SELECT COUNT(*) as cnt FROM staff WHERE admin_id = ?");
$myStaff->execute([$adminId]);
$myStaffCount = (int)$myStaff->fetch()['cnt'];

// myTeams: only manager's own teams
$myTeams = $db->prepare("SELECT COUNT(*) as cnt FROM teams WHERE admin_id = ?");
$myTeams->execute([$adminId]);
$myTeamsCount = (int)$myTeams->fetch()['cnt'];

// myRoles (global)
$myRoles = $db->query("SELECT COUNT(*) as cnt FROM roles")->fetch()['cnt'];

// upcomingEvents: all active events with date >= today
$upcomingEvents = $db->query("
    SELECT e.*, (SELECT COUNT(DISTINCT tm.staff_id) FROM team_members tm JOIN teams t ON tm.team_id = t.id WHERE t.event_id = e.id) as staff_count
    FROM events e WHERE e.event_date >= date('now') AND e.status = 'active'
    ORDER BY e.event_date ASC LIMIT 5
");

// recentTeams: only manager's teams
$recentTeams = $db->prepare("
    SELECT t.*, e.event_name, (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
    FROM teams t JOIN events e ON t.event_id = e.id
    WHERE t.admin_id = ? ORDER BY t.created_at DESC LIMIT 5
");
$recentTeams->execute([$adminId]);

// recentStaff: only manager's staff
$recentStaff = $db->prepare("
    SELECT DISTINCT s.* FROM staff s
    WHERE s.admin_id = ?
    ORDER BY s.created_at DESC LIMIT 5
");
$recentStaff->execute([$adminId]);

// most recent active event (admin may have teams in it)
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
        'myEvents' => $myEventsCount,
        'myStaff' => $myStaffCount,
        'myTeams' => $myTeamsCount,
        'myRoles' => (int)$myRoles,
    ],
    'upcomingEvents' => $upcomingEvents->fetchAll(),
    'recentTeams' => $recentTeams->fetchAll(),
    'recentStaff' => $recentStaff->fetchAll(),
    'recentEvent' => $recentEvent,
]);
