/**
 * @fileoverview App – root component for Next Train From.
 *
 * Renders the station search controls, fetches live departure data via the
 * `useTrainData` hook, and displays the resulting train list with expandable
 * detail cards.
 *
 * @module App
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import useTrainData from './data.js';
import TrainDetails from './trainDetails.jsx';
import { InfoIcon, getStatusIcon, getOperatorIcon, BritishRailLogo } from './icons.jsx';
import StationSearch from './StationSearch.jsx';
import CMFloatAd from './cmFloatAd.jsx';

/**
 * App
 *
 * Top-level component. Holds the station/filter codes in state, delegates
 * data fetching to `useTrainData`, and maps departures to interactive list
 * items that expand to show full service details.
 *
 * @returns {JSX.Element}
 */
function App() {
  const [stationCode, setStationCode] = useState('');
  const [callingAtCode, setCallingAtCode] = useState('');
  const [selectedTrain, setSelectedTrain] = useState(null);
  const { data, loading, error } = useTrainData(stationCode, callingAtCode);

  /**
   * Format an ISO date string (YYYY-MM-DD) as DD/MM/YYYY for display.
   * @param {string} dateStr - ISO date string from the TransportAPI response.
   * @returns {string} Formatted date, or empty string if input is falsy.
   */
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  /**
   * Toggle the expanded details panel for a train row.
   * Clicking an already-selected row collapses it.
   * @param {number} trainIndex - Index of the train in `data.departures.all`.
   */
  const handleTrainClick = (trainIndex) => {
    setSelectedTrain(selectedTrain === trainIndex ? null : trainIndex);
  };

  return (
    <MantineProvider>
      <>
        <header className="app-header">
          <BritishRailLogo size="2.5em" />
          <h2>Next Train from...</h2>
        </header>

        <div className="searchbox">
          <StationSearch
            onSelect={setStationCode}
            placeholder="Search station..."
          />
          <StationSearch
            onSelect={setCallingAtCode}
            placeholder="Calling at..."
          />
        </div>

        {loading && (
          <div className="spinner" role="status" aria-label="Loading departures" />
        )}

        {error && (
          <div className="error-message" role="alert">
            <p>Could not load departure data.</p>
            <p className="error-detail">{error.message}</p>
          </div>
        )}

        {data && (
          <div className="main-content">
            <h3>
              {data.station_name} ({data.station_code}) as of {formatDate(data.date)} {data.time_of_day}
            </h3>

            {data.departures.all.length === 0 ? (
              <div className="no-trains-message">
                <p>No trains found matching your search criteria.</p>
                {callingAtCode && (
                  <p>Try removing the &ldquo;calling at&rdquo; filter or selecting a different station.</p>
                )}
              </div>
            ) : (
              <div className="train-list">
                <ul>
                  {data.departures.all.map((train, index) => (
                    /* li wraps both the clickable row and the collapsible details panel,
                       keeping ul children valid (no div/section as direct ul children). */
                    <li key={index} style={{ '--item-index': index }}>
                      <div
                        onClick={() => handleTrainClick(index)}
                        className={`train-item ${selectedTrain === index ? 'selected' : ''}`}
                        role="button"
                        aria-expanded={selectedTrain === index}
                        tabIndex={0}
                        onKeyDown={e => e.key === 'Enter' && handleTrainClick(index)}
                      >
                        <span className="column1">
                          <strong>Platform {train.platform}:</strong>
                          <span className="leftgap" />
                          {train.aimed_departure_time} to {train.destination_name}
                        </span>
                        <span className="column2">
                          {getOperatorIcon(train.operator)}
                          <span className="leftgap">{train.operator_name}</span>
                        </span>
                        <span className="column2">
                          {getStatusIcon(train.status, '0.9em')}
                          <span className={`status-${train.status.toLowerCase().replace(' ', '-')}`}>
                            {train.status}
                          </span>
                        </span>
                        <span className="column2">
                          {train.best_departure_estimate_mins !== null && (
                            <span className="leftgap">Due in {train.best_departure_estimate_mins} mins</span>
                          )}
                        </span>
                        <span className="leftgap click-indicator"><InfoIcon /></span>
                      </div>

                      {selectedTrain === index && (
                        <TrainDetails train={{ ...train, index }} />
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <CMFloatAd color="#6d6b6b" bgColor="transparent" />
      </>
    </MantineProvider>
  );
}

export default App;
