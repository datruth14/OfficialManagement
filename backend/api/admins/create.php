<?php

$auth = requireAuth();
if (!in_array($auth['role'], ['super_admin', 'super_user'])) {
    errorResponse('Forbidden', 403);
}

$input = json_decode(file_get_contents('php://input'), true);
$fullname = trim($input['fullname'] ?? '');
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';
$email = trim($input['email'] ?? '');
$phone = trim($input['phone'] ?? '');
$department = trim($input['department'] ?? '');

if (!$fullname || !$username || !$password) {
    errorResponse('Fullname, username, and password are required');
}

$db = getDb();

$stmt = $db->prepare("SELECT COUNT(*) as cnt FROM admins WHERE username = ?");
$stmt->execute([$username]);
if ((int)$stmt->fetch()['cnt'] > 0) {
    errorResponse('Username already exists');
}

$hash = password_hash($password, PASSWORD_BCRYPT);
$stmt = $db->prepare("INSERT INTO admins (fullname, username, email, phone, password, department, role)
                      VALUES (?, ?, ?, ?, ?, ?, 'admin')");
$stmt->execute([$fullname, $username, $email, $phone, $hash, $department]);

$id = $db->lastInsertId();
$stmt = $db->prepare("SELECT id, fullname, username, email, phone, department, status, role FROM admins WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Admin created successfully');
