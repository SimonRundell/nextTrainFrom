/**
 * @fileoverview StationSearch – reusable typeahead station picker for UK rail stations.
 *
 * Loads the full station list from /stations.json once (module-level cache avoids
 * duplicate HTTP requests when the component is mounted twice on the same page).
 * Filters client-side as the user types; requires MIN_SEARCH_LENGTH characters
 * before showing results.
 *
 * @module StationSearch
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

/** Minimum characters before the dropdown appears. */
const MIN_SEARCH_LENGTH = 3;

/** Maximum number of results shown in the dropdown. */
const MAX_RESULTS = 5;

/** Module-level cache so both instances share one HTTP request. */
let _stationsCache = null;

/**
 * StationSearch
 *
 * Typeahead input for selecting a UK rail station by name or CRS code.
 * Calls `onSelect` with the chosen CRS code on selection, or with an
 * empty string when the field is cleared.
 *
 * @param {Object}   props
 * @param {function} props.onSelect                        - `(crsCode: string) => void`.
 *                                                           Receives `''` when cleared.
 * @param {string}   [props.placeholder='Search station...'] - Input placeholder text.
 * @returns {JSX.Element}
 */
function StationSearch({ onSelect, placeholder = 'Search station...' }) {
  const [stations, setStations] = useState(_stationsCache ?? []);
  const [search, setSearch] = useState('');
  const [selectedStation, setSelectedStation] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef(null);

  /** Load station list once; use cache on subsequent mounts. */
  useEffect(() => {
    if (_stationsCache) return;
    axios.get('/stations.json')
      .then(res => {
        _stationsCache = res.data;
        setStations(res.data);
      })
      .catch(err => console.error('Failed to load stations list:', err));
  }, []);

  /** Close dropdown on outside click. */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStations = stations
    .filter(s =>
      s.stationName.toLowerCase().includes(search.toLowerCase()) ||
      s.crsCode.toLowerCase().includes(search.toLowerCase())
    )
    .slice(0, MAX_RESULTS);

  /**
   * Confirm a station selection from the dropdown.
   * @param {{ stationName: string, crsCode: string }} station
   */
  const handleSelect = (station) => {
    setSelectedStation(station);
    setSearch(station.stationName);
    setShowDropdown(false);
    onSelect(station.crsCode);
  };

  /** Show or hide the dropdown as the user types. */
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    setShowDropdown(value.length >= MIN_SEARCH_LENGTH);
  };

  /** Clear the field and notify the parent component. */
  const handleClear = () => {
    setSearch('');
    setSelectedStation(null);
    setShowDropdown(false);
    onSelect('');
  };

  return (
    <div className="search-stations-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          placeholder={placeholder}
          value={search}
          onChange={handleInputChange}
          onFocus={() => search.length >= MIN_SEARCH_LENGTH && setShowDropdown(true)}
          className="station-search-input"
          aria-label={placeholder}
          aria-autocomplete="list"
          aria-expanded={showDropdown}
        />
        {search && (
          <button
            className="clear-search-btn"
            onClick={handleClear}
            type="button"
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {showDropdown && (
        <ul className="station-list" role="listbox">
          {filteredStations.length > 0 ? (
            filteredStations.map(station => (
              <li
                key={station.crsCode}
                role="option"
                aria-selected={selectedStation?.crsCode === station.crsCode}
                className={selectedStation?.crsCode === station.crsCode ? 'selected' : ''}
                onClick={() => handleSelect(station)}
              >
                {station.stationName} ({station.crsCode})
              </li>
            ))
          ) : (
            <li className="no-results" role="option" aria-disabled="true">
              No stations found
            </li>
          )}
        </ul>
      )}

      {search.length > 0 && search.length < MIN_SEARCH_LENGTH && (
        <div className="search-hint">
          Type at least {MIN_SEARCH_LENGTH} characters to search
        </div>
      )}
    </div>
  );
}

export default StationSearch;
