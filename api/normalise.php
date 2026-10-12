<?php
/**
 * Converts a Darwin StationBoardWithDetails object into the response shape
 * the frontend expects (modelled on the old TransportAPI v3 live departures
 * response, so App.jsx/trainDetails.jsx/icons.jsx needed minimal changes).
 * Pure functions, no I/O.
 *
 * Darwin's REST API returns std/etd/sta/eta/atd/ata as full ISO 8601
 * datetimes in local (Europe/London) time, so differences are computed
 * from real DateTime objects rather than any "HH:MM" string parsing.
 *
 * @license CC BY-NC-SA 4.0
 */

/**
 * Parse a Darwin ISO datetime string.
 *
 * @param mixed $value Raw value from the API, or null/absent.
 * @return DateTimeImmutable|null Parsed datetime, or null if absent/invalid.
 */
function parseDarwinTime($value): ?DateTimeImmutable
{
    if (!is_string($value) || $value === '') {
        return null;
    }
    try {
        return new DateTimeImmutable($value, new DateTimeZone('Europe/London'));
    } catch (Exception $e) {
        return null;
    }
}

/**
 * Format a parsed Darwin time as "HH:MM".
 *
 * @param DateTimeImmutable|null $dt Parsed time.
 * @return string|null "HH:MM", or null if absent.
 */
function formatHm(?DateTimeImmutable $dt): ?string
{
    return $dt !== null ? $dt->format('H:i') : null;
}

/**
 * Whole minutes from $from to $to (can be negative).
 *
 * @param DateTimeImmutable $from Earlier time.
 * @param DateTimeImmutable $to   Later time.
 * @return int Signed minutes.
 */
function minutesDiff(DateTimeImmutable $from, DateTimeImmutable $to): int
{
    return (int) round(($to->getTimestamp() - $from->getTimestamp()) / 60);
}

/**
 * Minutes from now until a given time, 0 if already due or in the past.
 *
 * @param DateTimeImmutable|null $time Target time.
 * @param DateTimeImmutable      $now  Current time.
 * @return int|null Minutes from now, or null if $time is absent.
 */
function minutesFromNow(?DateTimeImmutable $time, DateTimeImmutable $now): ?int
{
    return $time !== null ? max(0, minutesDiff($now, $time)) : null;
}

/**
 * Work out status and expected time from a std/etd/atd set.
 *
 * @param DateTimeImmutable|null $std       Scheduled time.
 * @param DateTimeImmutable|null $etd       Forecast time, if given.
 * @param DateTimeImmutable|null $atd       Actual time, if the train has already left/arrived.
 * @param bool                   $cancelled True when the service is cancelled.
 * @param int                    $threshold Minutes either side of scheduled that still counts as on time.
 * @return array{status:string, expected:DateTimeImmutable|null}
 */
function computeStatus(?DateTimeImmutable $std, ?DateTimeImmutable $etd, ?DateTimeImmutable $atd, bool $cancelled, int $threshold = 1): array
{
    if ($cancelled) {
        return ['status' => 'Cancelled', 'expected' => $std];
    }
    $actual = $atd ?? $etd;
    if ($std === null || $actual === null) {
        // No live forecast yet (common near the edge of the time window).
        return ['status' => 'On time', 'expected' => $std];
    }
    $diff = minutesDiff($std, $actual);
    if (abs($diff) <= $threshold) {
        return ['status' => 'On time', 'expected' => $actual];
    }
    return ['status' => $diff < 0 ? 'Early' : 'Late', 'expected' => $actual];
}

/**
 * Normalise one Darwin ServiceItem entry (trainServices[n]) into a
 * TransportAPI-shaped departure object.
 *
 * @param array              $svc Decoded service object.
 * @param DateTimeImmutable  $now Current time, for the "due in N mins" fields.
 * @return array The normalised departure.
 */
function normaliseService(array $svc, DateTimeImmutable $now): array
{
    $std = parseDarwinTime($svc['std'] ?? null);
    $etd = parseDarwinTime($svc['etd'] ?? null);
    $atd = parseDarwinTime($svc['atd'] ?? null);
    $sta = parseDarwinTime($svc['sta'] ?? null);
    $eta = parseDarwinTime($svc['eta'] ?? null);
    $ata = parseDarwinTime($svc['ata'] ?? null);
    $cancelled = !empty($svc['isCancelled']);

    $departure = computeStatus($std, $etd, $atd, $cancelled, 1);
    $arrival = $sta !== null ? computeStatus($sta, $eta, $ata, $cancelled, 1) : null;

    $origins = $svc['origin'] ?? [];
    $destinations = $svc['destination'] ?? [];
    $platform = trim((string) ($svc['platform'] ?? ''));

    return [
        'mode' => 'train',
        'service' => (string) ($svc['rid'] ?? ''),
        'train_uid' => (string) ($svc['uid'] ?? ''),
        'platform' => $platform !== '' ? $platform : 'TBC',
        'operator' => (string) ($svc['operatorCode'] ?? ''),
        'operator_name' => (string) ($svc['operator'] ?? ''),
        'origin_name' => (string) ($origins ? end($origins)['locationName'] ?? '' : ''),
        'destination_name' => (string) ($destinations ? end($destinations)['locationName'] ?? '' : ''),
        'aimed_departure_time' => formatHm($std),
        'expected_departure_time' => formatHm($departure['expected']),
        'aimed_arrival_time' => formatHm($sta),
        'expected_arrival_time' => $arrival !== null ? formatHm($arrival['expected']) : null,
        'status' => $departure['status'],
        'best_departure_estimate_mins' => minutesFromNow($departure['expected'] ?? $std, $now),
        'best_arrival_estimate_mins' => $arrival !== null ? minutesFromNow($arrival['expected'] ?? $sta, $now) : null,
        'category' => $svc['category'] ?? null,
        'source' => 'Live from Darwin',
    ];
}

/**
 * Normalise a whole board into the TransportAPI-shaped response envelope.
 *
 * @param array $board Decoded StationBoardWithDetails object.
 * @return array Response body (station_name, station_code, date, time_of_day, departures.all).
 */
function normaliseBoard(array $board): array
{
    $now = new DateTimeImmutable('now', new DateTimeZone('Europe/London'));
    $raw = $board['trainServices'] ?? [];
    // Sort by the raw ISO std first: it carries a full date, so this sorts
    // correctly across midnight with no rollover arithmetic needed.
    usort($raw, fn(array $a, array $b): int => strcmp((string) ($a['std'] ?? ''), (string) ($b['std'] ?? '')));
    $services = [];
    foreach ($raw as $svc) {
        $services[] = normaliseService($svc, $now);
    }

    return [
        'station_name' => (string) ($board['locationName'] ?? ''),
        'station_code' => (string) ($board['crs'] ?? ''),
        'date' => $now->format('Y-m-d'),
        'time_of_day' => $now->format('H:i:s'),
        'departures' => ['all' => $services],
    ];
}
