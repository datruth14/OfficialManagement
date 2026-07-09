<?php

$auth = requireAuth();
$teamId = $GLOBALS['route_id'];

$format = $_GET['format'] ?? 'json';
$db = getDb();

$stmt = $db->prepare("SELECT t.*, e.event_name FROM teams t JOIN events e ON t.event_id = e.id WHERE t.id = ?");
$stmt->execute([$teamId]);
$team = $stmt->fetch();

if (!$team) {
    errorResponse('Team not found', 404);
}

if (!in_array($auth['role'], ['super_admin', 'super_user']) && (int)$team['admin_id'] !== (int)$auth['id']) {
    errorResponse('Forbidden', 403);
}

$stmt = $db->prepare("
    SELECT s.id, s.staff_id, s.firstname, s.lastname, s.email, s.phone, s.gender, s.status,
           GROUP_CONCAT(r.name) as roles
    FROM team_members tm
    JOIN staff s ON tm.staff_id = s.id
    LEFT JOIN staff_roles sr ON s.id = sr.staff_id
    LEFT JOIN roles r ON sr.role_id = r.id
    WHERE tm.team_id = ?
    GROUP BY s.id
");
$stmt->execute([$teamId]);
$members = $stmt->fetchAll();

if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="team_' . $teamId . '.csv"');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Staff ID', 'Firstname', 'Lastname', 'Email', 'Phone', 'Gender', 'Status', 'Roles']);
    foreach ($members as $member) {
        fputcsv($output, $member);
    }
    fclose($output);
    exit;
}

jsonResponse(['team' => $team, 'members' => $members]);
