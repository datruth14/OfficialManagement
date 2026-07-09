<?php

require_once __DIR__ . '/../utils/jwt.php';
require_once __DIR__ . '/../utils/response.php';

function requireAuth(): array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        errorResponse('Authorization header required', 401);
    }

    $payload = verifyToken($matches[1]);
    if (!$payload) {
        errorResponse('Invalid or expired token', 401);
    }

    return $payload;
}

function requireSuperAdmin(): array {
    $user = requireAuth();
    if (!in_array($user['role'], ['super_admin', 'super_user'])) {
        errorResponse('Forbidden: super admin only', 403);
    }
    return $user;
}

function getAuthUser(): ?array {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^Bearer\s+(.+)$/i', $authHeader, $matches)) {
        return null;
    }
    return verifyToken($matches[1]);
}
