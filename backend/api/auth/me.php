<?php

$user = requireAuth();
$db = getDb();
$stmt = $db->prepare("SELECT id, fullname, username, email, phone, department, status, role FROM admins WHERE id = ?");
$stmt->execute([$user['id']]);
$admin = $stmt->fetch();

if (!$admin) {
    session_destroy();
    errorResponse('User not found', 404);
}

$_SESSION['user'] = $admin;
jsonResponse($admin);
