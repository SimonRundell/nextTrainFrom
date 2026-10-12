<?php
/**
 * Live Departure Boards Staff Web Service (LDBSVWS) REST client, accessed via
 * the Rail Data Marketplace. Plain JSON over HTTPS, authenticated with an
 * x-apikey header.
 *
 * @license CC BY-NC-SA 4.0
 */

/**
 * Fetch a departure board with calling point details.
 *
 * @param array       $config    Validated config.
 * @param string      $from      Origin CRS.
 * @param string|null $filterCrs CRS to filter to ("calling at"), or null for
 *                                an unfiltered board.
 * @param int         $rows      Maximum rows. The API accepts 1-9 for this operation.
 * @return array The decoded StationBoardWithDetails object.
 * @throws RuntimeException On transport, HTTP or API error.
 */
function fetchDepartureBoard(array $config, string $from, ?string $filterCrs, int $rows = 9): array
{
    $time = (new DateTime('now', new DateTimeZone('Europe/London')))->format('Ymd\THis');
    $params = [
        'numRows' => max(1, min(9, $rows)),
        'timeWindow' => 120,
    ];
    if ($filterCrs !== null) {
        $params['filterCrs'] = $filterCrs;
        $params['filterType'] = 'to';
    }
    $url = rtrim($config['darwin']['endpoint'], '/')
        . '/GetDepBoardWithDetails/' . rawurlencode($from) . '/' . $time
        . '?' . http_build_query($params);

    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_HTTPGET => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_TIMEOUT => 10,
        CURLOPT_CONNECTTIMEOUT => 5,
        CURLOPT_HTTPHEADER => [
            'x-apikey: ' . $config['darwin']['apiKey'],
            'Accept: application/json',
        ],
    ]);
    $body = curl_exec($ch);
    $status = (int) curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($body === false) {
        throw new RuntimeException('Darwin unreachable: ' . $err);
    }
    $data = json_decode($body, true);
    if (!is_array($data)) {
        throw new RuntimeException('Darwin returned unreadable data (HTTP ' . $status . ')');
    }
    if ($status !== 200) {
        $message = (string) ($data['message'] ?? $data['error'] ?? ('HTTP ' . $status));
        throw new RuntimeException('Darwin error: ' . $message);
    }
    return $data;
}
