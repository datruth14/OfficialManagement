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

jsonResponse($stmt->fetchAll());
