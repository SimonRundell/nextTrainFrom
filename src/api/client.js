/**
 * @fileoverview Axios instance and departures fetcher for the PHP backend.
 *
 * @module api/client
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import axios from 'axios';

/**
 * Base URL of the PHP API. In development this comes from `devApiBase` in
 * .config.json (injected at dev-server start by vite.config.js), since Vite
 * and the PHP API run on different ports. In production the API sits beside
 * the built app, so a relative path is used.
 * @type {string}
 */
const API_BASE = import.meta.env.VITE_API_BASE || './api';

/**
 * Shared Axios instance for all API calls. A trailing slash keeps relative paths tidy.
 * @type {import('axios').AxiosInstance}
 */
export const http = axios.create({ baseURL: API_BASE.replace(/\/?$/, '/'), timeout: 15000 });

/**
 * Fetch live departures for a station, optionally filtered to a second
 * "calling at" station.
 * @param {string} from - CRS code of the departure station, e.g. `'EXD'`.
 * @param {string} [callingAt] - CRS code to filter to, or omit for all departures.
 * @returns {Promise<object>} The TransportAPI-shaped departures envelope.
 */
export async function fetchDepartures(from, callingAt) {
  const { data } = await http.get('departures.php', {
    params: { from, ...(callingAt ? { callingAt } : {}) },
  });
  return data;
}
