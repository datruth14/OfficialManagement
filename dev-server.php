<?php
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// API routes
if (str_starts_with($uri, '/api/')) {
    require __DIR__ . '/backend/api/index.php';
    return true;
}

// Serve files from stm_php/ directory
$filePath = __DIR__ . $uri;
if ($uri !== '/' && is_file($filePath)) {
    $ext = pathinfo($filePath, PATHINFO_EXTENSION);
    $mimeTypes = [
        'css' => 'text/css',
        'js'  => 'application/javascript',
        'json' => 'application/json',
        'svg' => 'image/svg+xml',
        'png' => 'image/png',
        'ico' => 'image/x-icon',
        'html' => 'text/html',
    ];
    if (isset($mimeTypes[$ext])) {
        header('Content-Type: ' . $mimeTypes[$ext]);
    }
    readfile($filePath);
    return true;
}

// SPA fallback
readfile(__DIR__ . '/index.html');
return true;
