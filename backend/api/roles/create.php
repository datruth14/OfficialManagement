<?php

$auth = requireAuth();
if ($auth['role'] === 'super_admin') {
    errorResponse('Program manager is read-only', 403);
}
$input = json_decode(file_get_contents('php://input'), true);

$name = trim($input['name'] ?? '');
$description = trim($input['description'] ?? '');

if (!$name) {
    errorResponse('Role name is required');
}

$db = getDb();

$stmt = $db->prepare("SELECT COUNT(*) as cnt FROM roles WHERE name = ?");
$stmt->execute([$name]);
if ((int)$stmt->fetch()['cnt'] > 0) {
    errorResponse('Role name already exists');
}

$stmt = $db->prepare("INSERT INTO roles (name, description) VALUES (?, ?)");
$stmt->execute([$name, $description]);

$id = $db->lastInsertId();
$stmt = $db->prepare("SELECT * FROM roles WHERE id = ?");
$stmt->execute([$id]);

successResponse($stmt->fetch(), 'Role created successfully');
