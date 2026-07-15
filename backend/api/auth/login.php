<?php

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = $input['password'] ?? '';

if (!$username || !$password) {
    errorResponse('Username and password required');
}

$db = getDb();
$stmt = $db->prepare("SELECT * FROM admins WHERE username = ?");
$stmt->execute([$username]);
$admin = $stmt->fetch();

if (!$admin || !password_verify($password, $admin['password'])) {
    errorResponse('Invalid credentials', 401);
}

if ($admin['status'] !== 'active') {
    errorResponse('Account is inactive', 403);
}

$_SESSION['user'] = [
    'id' => $admin['id'],
    'fullname' => $admin['fullname'],
    'username' => $admin['username'],
    'email' => $admin['email'],
    'phone' => $admin['phone'],
    'department' => $admin['department'],
    'status' => $admin['status'],
    'role' => $admin['role'],
];

jsonResponse([
    'user' => $_SESSION['user'],
]);
