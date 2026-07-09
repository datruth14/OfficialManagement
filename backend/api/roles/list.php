<?php

requireAuth();
$db = getDb();

$stmt = $db->query("SELECT r.*, (SELECT COUNT(*) FROM staff_roles sr WHERE sr.role_id = r.id) as staff_count
                    FROM roles r ORDER BY r.created_at DESC");

jsonResponse($stmt->fetchAll());
