/**
 * @fileoverview useTrainData – custom hook for fetching live UK rail departures.
 *
 * Queries our own PHP backend, which calls the Rail Data Marketplace's
 * Live Departure Boards Staff Web Service (LDBSVWS) server-side so the API
 * key never reaches the browser. Returns `{ data, loading, error }`.
 *
 * @module data
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import { useEffect, useState } from 'react';
import { fetchDepartures } from './api/client.js';

/** CRS codes must be at least this many characters before a fetch is attempted. */
const MIN_STATION_CODE_LENGTH = 3;

/**
 * useTrainData
 *
 * Fetches live departures for a given station, optionally filtered to
 * trains calling at a second station.
 *
 * @param {string} stationCode    - CRS code of the departure station (e.g. `'EXD'`).
 * @param {string} callingAtCode  - CRS code for the calling-at filter; pass `''` to omit.
 * @returns {{ data: Object|null, loading: boolean, error: Error|null }}
 */
function useTrainData(stationCode, callingAtCode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  /** Re-fetch departures whenever the station code or filter changes. */
  useEffect(() => {
    if (!stationCode || stationCode.length < MIN_STATION_CODE_LENGTH) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        const callingAt = callingAtCode && callingAtCode.trim().length >= MIN_STATION_CODE_LENGTH
          ? callingAtCode
          : undefined;
        const result = await fetchDepartures(stationCode, callingAt);
        setData(result);
      } catch (err) {
        console.error('Error fetching departures:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stationCode, callingAtCode]);

  return { data, loading, error };
}

export default useTrainData;
