<?php

require_once __DIR__ . '/../config/database.php';
require_once __DIR__ . '/../utils/cors.php';
require_once __DIR__ . '/../utils/response.php';
require_once __DIR__ . '/../middleware/auth.php';

handleCors();

$method = $_SERVER['REQUEST_METHOD'];
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/');
$parts = explode('/', trim($uri, '/'));
$basePath = __DIR__;

try {
    initDatabase();
    seedDefaultAdmin();
    // /api/auth/login
    if ($uri === '/api/auth/login' && $method === 'POST') {
        require "$basePath/auth/login.php";
        exit;
    }

    // /api/auth/me
    if ($uri === '/api/auth/me' && $method === 'GET') {
        require "$basePath/auth/me.php";
        exit;
    }

    // /api/dashboard/super-admin
    if ($uri === '/api/dashboard/super-admin' && $method === 'GET') {
        require "$basePath/dashboard/super_admin.php";
        exit;
    }

    // /api/dashboard/admin
    if ($uri === '/api/dashboard/admin' && $method === 'GET') {
        require "$basePath/dashboard/admin.php";
        exit;
    }

    // /api/export/admins
    if ($uri === '/api/export/admins' && $method === 'GET') {
        require "$basePath/export/admins.php";
        exit;
    }

    // /api/export/teams (all teams)
    if ($uri === '/api/export/teams' && $method === 'GET') {
        require "$basePath/export/all_teams.php";
        exit;
    }

    // /api/export/teams/{id}
    if (preg_match('#^/api/export/teams/(\d+)$#', $uri, $m) && $method === 'GET') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/export/teams.php";
        exit;
    }

    // --- ADMINS ---
    if ($uri === '/api/admins' && $method === 'GET') {
        require "$basePath/admins/list.php";
        exit;
    }
    if ($uri === '/api/admins' && $method === 'POST') {
        require "$basePath/admins/create.php";
        exit;
    }
    if (preg_match('#^/api/admins/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/admins/update.php";
        exit;
    }
    if (preg_match('#^/api/admins/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/admins/delete.php";
        exit;
    }

    // --- STAFF ---
    if ($uri === '/api/staff' && $method === 'GET') {
        require "$basePath/staff/list.php";
        exit;
    }
    if ($uri === '/api/staff' && $method === 'POST') {
        require "$basePath/staff/create.php";
        exit;
    }
    if (preg_match('#^/api/staff/(\d+)$#', $uri, $m) && $method === 'GET') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/staff/get.php";
        exit;
    }
    if (preg_match('#^/api/staff/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/staff/update.php";
        exit;
    }
    if (preg_match('#^/api/staff/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/staff/delete.php";
        exit;
    }
    if (preg_match('#^/api/staff/(\d+)/roles$#', $uri, $m) && $method === 'POST') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/staff/assign_roles.php";
        exit;
    }
    if (preg_match('#^/api/staff/(\d+)/roles/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_staff_id'] = (int)$m[1];
        $GLOBALS['route_role_id'] = (int)$m[2];
        require "$basePath/staff/remove_role.php";
        exit;
    }

    // --- EVENTS ---
    if ($uri === '/api/events' && $method === 'GET') {
        require "$basePath/events/list.php";
        exit;
    }
    if ($uri === '/api/events' && $method === 'POST') {
        require "$basePath/events/create.php";
        exit;
    }
    if (preg_match('#^/api/events/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/events/update.php";
        exit;
    }
    if (preg_match('#^/api/events/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/events/delete.php";
        exit;
    }
    if (preg_match('#^/api/events/(\d+)/teams$#', $uri, $m) && $method === 'GET') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/events/assign_teams.php";
        exit;
    }

    // --- ROLES ---
    if ($uri === '/api/roles' && $method === 'GET') {
        require "$basePath/roles/list.php";
        exit;
    }
    if ($uri === '/api/roles' && $method === 'POST') {
        require "$basePath/roles/create.php";
        exit;
    }
    if (preg_match('#^/api/roles/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/roles/update.php";
        exit;
    }
    if (preg_match('#^/api/roles/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/roles/delete.php";
        exit;
    }

    // --- TEAMS ---
    if ($uri === '/api/teams' && $method === 'GET') {
        require "$basePath/teams/list.php";
        exit;
    }
    if ($uri === '/api/teams' && $method === 'POST') {
        require "$basePath/teams/create.php";
        exit;
    }
    if (preg_match('#^/api/teams/(\d+)$#', $uri, $m) && $method === 'PUT') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/teams/update.php";
        exit;
    }
    if (preg_match('#^/api/teams/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/teams/delete.php";
        exit;
    }
    if (preg_match('#^/api/teams/(\d+)/members$#', $uri, $m) && $method === 'GET') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/teams/list_members.php";
        exit;
    }
    if (preg_match('#^/api/teams/(\d+)/members$#', $uri, $m) && $method === 'POST') {
        $GLOBALS['route_id'] = (int)$m[1];
        require "$basePath/teams/add_members.php";
        exit;
    }
    if (preg_match('#^/api/teams/(\d+)/members/(\d+)$#', $uri, $m) && $method === 'DELETE') {
        $GLOBALS['route_team_id'] = (int)$m[1];
        $GLOBALS['route_member_id'] = (int)$m[2];
        require "$basePath/teams/remove_member.php";
        exit;
    }

    errorResponse('Not found', 404);
} catch (PDOException $e) {
    errorResponse('Database error: ' . $e->getMessage(), 500);
} catch (Exception $e) {
    errorResponse($e->getMessage(), 500);
}
