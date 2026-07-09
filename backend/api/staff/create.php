<?php

$auth = requireAuth();
if ($auth['role'] === 'super_admin') {
    errorResponse('Program manager is read-only', 403);
}
$input = json_decode(file_get_contents('php://input'), true);

$firstname = trim($input['firstname'] ?? '');
$lastname = trim($input['lastname'] ?? '');
$email = trim($input['email'] ?? '') ?: null;
$phone = trim($input['phone'] ?? '') ?: null;
$address = trim($input['address'] ?? '') ?: null;
$gender = trim($input['gender'] ?? '') ?: null;
$status = trim($input['status'] ?? 'active');
$staffId = trim($input['staff_id'] ?? '');
$teamIds = $input['team_ids'] ?? [];
$roleIds = $input['role_ids'] ?? [];

if (!$firstname || !$lastname) {
    errorResponse('Firstname and lastname are required');
}

$db = getDb();

if (empty($staffId)) {
    $staffId = 'STF-' . time();
}

$stmt = $db->prepare("INSERT INTO staff (staff_id, firstname, lastname, phone, email, address, gender, status, admin_id)
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
$stmt->execute([$staffId, $firstname, $lastname, $phone, $email, $address, $gender, $status, $auth['id']]);

$staffDbId = $db->lastInsertId();

// Assign to teams
foreach ((array)$teamIds as $tid) {
    $tm = $db->prepare("INSERT OR IGNORE INTO team_members (team_id, staff_id) VALUES (?, ?)");
    $tm->execute([(int)$tid, $staffDbId]);
}

// Assign roles
foreach ((array)$roleIds as $rid) {
    $sr = $db->prepare("INSERT OR IGNORE INTO staff_roles (staff_id, role_id) VALUES (?, ?)");
    $sr->execute([$staffDbId, (int)$rid]);
}

$stmt = $db->prepare("SELECT * FROM staff WHERE id = ?");
$stmt->execute([$staffDbId]);

successResponse($stmt->fetch(), 'Staff created successfully');
