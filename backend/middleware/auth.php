<?php

require_once __DIR__ . '/../utils/response.php';

function requireAuth(): array {
    if (empty($_SESSION['user'])) {
        errorResponse('Authentication required', 401);
    }
    return $_SESSION['user'];
}

function requireSuperAdmin(): array {
    $user = requireAuth();
    if (!in_array($user['role'], ['super_admin', 'super_user'])) {
        errorResponse('Forbidden: super admin only', 403);
    }
    return $user;
}

function getAuthUser(): ?array {
    return $_SESSION['user'] ?? null;
}