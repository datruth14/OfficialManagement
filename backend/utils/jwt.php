<?php

define('JWT_SECRET', 'staff-management-secret-key-2025');
define('JWT_EXPIRY', 86400);

function base64urlEncode(string $data): string {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
}

function base64urlDecode(string $data): string {
    return base64_decode(strtr($data, '-_', '+/'));
}

function generateToken(array $payload): string {
    $header = base64urlEncode(json_encode(['alg' => 'HS256', 'typ' => 'JWT']));
    $payload['iat'] = time();
    $payload['exp'] = time() + JWT_EXPIRY;
    $payloadEncoded = base64urlEncode(json_encode($payload));
    $signature = base64urlEncode(
        hash_hmac('sha256', "$header.$payloadEncoded", JWT_SECRET, true)
    );
    return "$header.$payloadEncoded.$signature";
}

function verifyToken(string $token): ?array {
    $parts = explode('.', $token);
    if (count($parts) !== 3) return null;

    [$header, $payload, $signature] = $parts;
    $expectedSig = base64urlEncode(
        hash_hmac('sha256', "$header.$payload", JWT_SECRET, true)
    );

    if (!hash_equals($expectedSig, $signature)) return null;

    $data = json_decode(base64urlDecode($payload), true);
    if (!$data || !isset($data['exp']) || $data['exp'] < time()) return null;

    return $data;
}
