<?php
/**
 * Configuration loader for the Next Train From API.
 *
 * Reads .config.json from the project root (next to /api), falling back to
 * one directory above for hosts with a dedicated document root. The project
 * root is checked first because on shared hosting the directory above may
 * belong to a sibling site and hold an unrelated .config.json. Never echoes
 * secrets.
 *
 * @license CC BY-NC-SA 4.0
 */

/**
 * Locate and decode .config.json without validating it.
 *
 * @return array|null Decoded config, or null when missing or malformed.
 */
function readConfigFile(): ?array
{
    $candidates = [
        dirname(__DIR__) . '/.config.json',
        dirname(__DIR__, 2) . '/.config.json',
    ];
    foreach ($candidates as $path) {
        if (is_file($path)) {
            $data = json_decode((string) file_get_contents($path), true);
            if (is_array($data)) {
                return $data;
            }
        }
    }
    return null;
}

/**
 * Send a JSON error and stop.
 *
 * @param int    $status  HTTP status code.
 * @param string $message Safe, generic message.
 * @return never
 */
function failJson(int $status, string $message): void
{
    http_response_code($status);
    echo json_encode(['error' => $message]);
    exit();
}

/**
 * Load, default and validate the configuration. Cached per request.
 *
 * @return array The validated configuration.
 */
function getConfig(): array
{
    static $config = null;
    if ($config !== null) {
        return $config;
    }
    $raw = readConfigFile();
    if ($raw === null) {
        failJson(500, 'Server configuration error.');
    }
    $defaults = [
        'cacheSeconds' => 30,
        'allowedOrigins' => [],
    ];
    $config = array_replace_recursive($defaults, $raw);
    if (empty($config['darwin']['endpoint']) || empty($config['darwin']['apiKey'])) {
        failJson(500, 'Server configuration error.');
    }
    $config['cacheSeconds'] = max(30, (int) $config['cacheSeconds']);
    return $config;
}
