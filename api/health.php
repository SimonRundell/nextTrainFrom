<?php
/**
 * GET /api/health.php
 *
 * Server time and basic status. No secrets.
 *
 * @license CC BY-NC-SA 4.0
 */

require_once __DIR__ . '/cors.php';   // always first
require_once __DIR__ . '/config.php';

getConfig();

echo json_encode([
    'ok' => true,
    'serverTime' => date('c'),
    'curl' => function_exists('curl_init'),
    'cacheWritable' => is_writable(__DIR__ . '/cache'),
]);
