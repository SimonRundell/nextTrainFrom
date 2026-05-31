/**
 * @fileoverview useTrainData – custom hook for fetching live UK rail departures.
 *
 * Reads API credentials from /public/.config.json (loaded once on mount), then
 * queries the TransportAPI live departures endpoint whenever the departure or
 * calling-at station code changes.  Returns `{ data, loading, error }`.
 *
 * @module data
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import { useEffect, useState } from 'react';
import axios from 'axios';

/** CRS codes must be at least this many characters before a fetch is attempted. */
const MIN_STATION_CODE_LENGTH = 3;

/**
 * useTrainData
 *
 * Fetches live departures from the TransportAPI for a given station, optionally
 * filtered to trains calling at a second station.
 *
 * @param {string} stationCode    - CRS code of the departure station (e.g. `'EXD'`).
 * @param {string} callingAtCode  - CRS code for the calling-at filter; pass `''` to omit.
 * @returns {{ data: Object|null, loading: boolean, error: Error|null }}
 */
function useTrainData(stationCode, callingAtCode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [config, setConfig] = useState({ app_id: '', app_key: '' });

  /** Load API credentials from .config.json once on mount. */
  useEffect(() => {
    fetch('/.config.json')
      .then(res => res.json())
      .then(cfg => setConfig(cfg))
      .catch(() => console.warn('Could not load /.config.json – API calls will fail without credentials.'));
  }, []);

  /** Re-fetch departures whenever the station code, filter, or config changes. */
  useEffect(() => {
    if (!stationCode || stationCode.length < MIN_STATION_CODE_LENGTH) {
      setData(null);
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        let url = `https://transportapi.com/v3/uk/train/station/${stationCode}/live.json`
          + `?app_id=${config.app_id}&app_key=${config.app_key}`
          + `&darwin=true&train_status=passenger`;

        if (callingAtCode && callingAtCode.trim().length >= MIN_STATION_CODE_LENGTH) {
          url += `&calling_at=${callingAtCode}`;
        }

        const response = await axios.get(url);
        setData(response.data);
      } catch (err) {
        console.error('Error fetching departures:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [stationCode, callingAtCode, config.app_id, config.app_key]);

  return { data, loading, error };
}

export default useTrainData;
