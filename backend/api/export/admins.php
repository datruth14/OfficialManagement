<?php

requireSuperAdmin();

$format = $_GET['format'] ?? 'json';
$db = getDb();

$admins = $db->query("SELECT id, fullname, username, email, phone, department, status, created_at
                      FROM admins WHERE role = 'admin' ORDER BY created_at DESC")->fetchAll();

if ($format === 'csv') {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="admins.csv"');
    $output = fopen('php://output', 'w');
    fputcsv($output, ['ID', 'Fullname', 'Username', 'Email', 'Phone', 'Department', 'Status', 'Created At']);
    foreach ($admins as $admin) {
        fputcsv($output, $admin);
    }
    fclose($output);
    exit;
}

jsonResponse($admins);
