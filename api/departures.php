<?php
/**
 * GET /api/departures.php?from=EXD[&callingAt=PLY]
 *
 * Returns a TransportAPI-shaped departures envelope for any UK station,
 * optionally filtered to services calling at a second station, cached on
 * the server.
 *
 * @license CC BY-NC-SA 4.0
 */

require_once __DIR__ . '/cors.php';   // always first
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/cache.php';
require_once __DIR__ . '/ldbws.php';
require_once __DIR__ . '/normalise.php';

$config = getConfig();

/**
 * Validate and uppercase a CRS code.
 *
 * @param string $value Raw query value.
 * @return string|null The uppercased 3-letter CRS code, or null if invalid/empty.
 */
function validateCrs(string $value): ?string
{
    $value = strtoupper(trim($value));
    return preg_match('/^[A-Z]{3}$/', $value) ? $value : null;
}

$from = validateCrs((string) ($_GET['from'] ?? ''));
if ($from === null) {
    failJson(400, 'A valid 3-letter "from" station code is required.');
}

$callingAtRaw = trim((string) ($_GET['callingAt'] ?? ''));
$callingAt = null;
if ($callingAtRaw !== '') {
    $callingAt = validateCrs($callingAtRaw);
    if ($callingAt === null) {
        failJson(400, 'The "callingAt" station code must be 3 letters.');
    }
}

$key = $from . ($callingAt !== null ? '_' . $callingAt : '');
$entry = cacheRead($key);
$age = cacheAge($entry);
if ($entry !== null && $age < $config['cacheSeconds']) {
    echo json_encode($entry['data']);
    exit();
}

try {
    $board = fetchDepartureBoard($config, $from, $callingAt, 9);
    $body = normaliseBoard($board);
    cacheWrite($key, $body);
    echo json_encode($body);
} catch (Throwable $e) {
    error_log('departures.php: ' . $e->getMessage());
    if ($entry !== null) {
        echo json_encode($entry['data']);
    } else {
        failJson(502, 'Train data is temporarily unavailable.');
    }
}
