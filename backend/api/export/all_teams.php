<?php

$auth = requireAuth();
$db = getDb();

// Fetch all teams (scoped like teams list)
$sql = "SELECT t.*, e.event_name,
        (SELECT COUNT(*) FROM team_members tm WHERE tm.team_id = t.id) as member_count
        FROM teams t JOIN events e ON t.event_id = e.id";
$conditions = [];
$params = [];

if (!in_array($auth['role'], ['super_admin', 'super_user'])) {
    $conditions[] = "t.admin_id = ?";
    $params[] = $auth['id'];
}

if (!empty($conditions)) {
    $sql .= " WHERE " . implode(' AND ', $conditions);
}
$sql .= " ORDER BY e.event_name, t.team_name";

$teams = $db->prepare($sql);
$teams->execute($params);
$teams = $teams->fetchAll();

header('Content-Type: text/csv');
header('Content-Disposition: attachment; filename="all_teams.csv"');
$output = fopen('php://output', 'w');
fputcsv($output, ['Event', 'Team', 'Member Name', 'Official ID', 'Email', 'Phone', 'Gender', 'Status', 'Roles']);

foreach ($teams as $team) {
    $stmt = $db->prepare("
        SELECT s.id, s.staff_id, s.firstname, s.lastname, s.email, s.phone, s.gender, s.status,
               GROUP_CONCAT(r.name, '; ') as roles
        FROM team_members tm
        JOIN staff s ON tm.staff_id = s.id
        LEFT JOIN staff_roles sr ON s.id = sr.staff_id
        LEFT JOIN roles r ON sr.role_id = r.id
        WHERE tm.team_id = ?
        GROUP BY s.id
        ORDER BY s.lastname, s.firstname
    ");
    $stmt->execute([$team['id']]);
    $members = $stmt->fetchAll();

    if (empty($members)) {
        fputcsv($output, [$team['event_name'], $team['team_name'], '(no members)', '', '', '', '', '', '']);
    } else {
        foreach ($members as $m) {
            fputcsv($output, [
                $team['event_name'],
                $team['team_name'],
                $m['firstname'] . ' ' . $m['lastname'],
                $m['staff_id'],
                $m['email'] ?? '',
                $m['phone'] ?? '',
                $m['gender'] ?? '',
                $m['status'],
                $m['roles'] ?? '',
            ]);
        }
    }
}

fclose($output);
