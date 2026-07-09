<?php

function jsonResponse(mixed $data, int $status = 200): void {
    http_response_code($status);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

function errorResponse(string $message, int $status = 400): void {
    jsonResponse(['error' => $message], $status);
}

function successResponse(mixed $data = null, string $message = 'Success'): void {
    jsonResponse(['message' => $message, 'data' => $data]);
}
