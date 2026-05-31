/**
 * @fileoverview TrainDetails – expandable service detail card.
 *
 * Rendered below a selected train row in the departure list.  Animates in
 * on mount via a CSS class toggle and displays journey, timing, and platform
 * information sourced from the TransportAPI departure object.
 *
 * @module TrainDetails
 * @license CC BY-NC-SA 4.0 https://creativecommons.org/licenses/by-nc-sa/4.0/
 */

import { useState, useEffect } from 'react';
import {
  TrainIcon,
  StationIcon,
  ClockIcon,
  PlatformIcon,
  getStatusIcon,
  getOperatorIcon,
  ScheduleIcon,
} from './icons.jsx';

/**
 * TrainDetails
 *
 * Displays full service information for a single departure.  A 10 ms mount
 * delay triggers the CSS transition so the card slides in smoothly.
 *
 * @param {Object} props
 * @param {Object} props.train - Departure object from `data.departures.all`,
 *   augmented with an `index` property used for keying by the parent.
 * @returns {JSX.Element}
 */
function TrainDetails({ train }) {
  const [isVisible, setIsVisible] = useState(false);

  /** Tiny delay so the CSS transition fires after the element is in the DOM. */
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`train-details ${isVisible ? 'visible' : ''}`}>
      <div className="details-card">
        <h4><TrainIcon size="1.2em" /> Train Service Details</h4>

        <div className="details-grid">
          <div className="detail-section">
            <h5><StationIcon /> Journey Information</h5>
            <p><strong>Service ID:</strong> {train.service}</p>
            <p><strong>Train UID:</strong> {train.train_uid}</p>
            <p><strong>Origin:</strong> {train.origin_name}</p>
            <p><strong>Destination:</strong> {train.destination_name}</p>
            <p>
              <strong>Operator:</strong>{' '}
              {getOperatorIcon(train.operator)} {train.operator_name} ({train.operator})
            </p>
          </div>

          <div className="detail-section">
            <h5><ClockIcon /> Timing Details</h5>
            <p><strong>Scheduled Arrival:</strong> {train.aimed_arrival_time || 'N/A'}</p>
            <p><strong>Expected Arrival:</strong> {train.expected_arrival_time || 'N/A'}</p>
            <p><strong>Scheduled Departure:</strong> {train.aimed_departure_time}</p>
            <p><strong>Expected Departure:</strong> {train.expected_departure_time}</p>
            {train.best_arrival_estimate_mins !== null && (
              <p><strong>Arrival in:</strong> {train.best_arrival_estimate_mins} minutes</p>
            )}
            {train.best_departure_estimate_mins !== null && (
              <p><strong>Departure in:</strong> {train.best_departure_estimate_mins} minutes</p>
            )}
          </div>

          <div className="detail-section">
            <h5><PlatformIcon /> Platform &amp; Status</h5>
            <p><strong>Platform:</strong> {train.platform}</p>
            <p>
              <strong>Status:</strong>{' '}
              {getStatusIcon(train.status, '1em', 'status-icon')}
              <span className={`status-badge status-${train.status.toLowerCase().replace(' ', '-')}`}>
                {train.status}
              </span>
            </p>
            <p><strong>Category:</strong> {train.category}</p>
            <p><strong>Mode:</strong> {train.mode}</p>
            <p><strong>Source:</strong> {train.source}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TrainDetails;
