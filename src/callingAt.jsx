import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function CallingAt({setCallingAtCode}) {

const [stations, setStations] = useState([]);
const [search, setSearch] = useState('');
const [selectedStation, setSelectedStation] = useState(null);
const [showDropdown, setShowDropdown] = useState(false);
const containerRef = useRef(null);

useEffect(() => {
    const fetchStations = async () => {
        try {
            const response = await axios.get('/stations.json');
            setStations(response.data);
        } catch (error) {
            console.error('Error fetching stations:', error);
        }
    };

    fetchStations();
}, []);

// Handle clicking outside to close dropdown
useEffect(() => {
    const handleClickOutside = (event) => {
        if (containerRef.current && !containerRef.current.contains(event.target)) {
            setShowDropdown(false);
        }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
}, []);

const filteredStations = stations.filter(
    station =>
        station.stationName.toLowerCase().includes(search.toLowerCase()) ||
        station.crsCode.toLowerCase().includes(search.toLowerCase())
);

const setStation = (station) => {
    setCallingAtCode(station.crsCode);
    setSearch(station.stationName); // Update search input with selected station name
    setShowDropdown(false); // Hide dropdown after selection
};

const handleInputChange = (e) => {
    setSearch(e.target.value);
    setShowDropdown(e.target.value.length >= 3); // Show dropdown when 3+ characters
};

const clearSearch = () => {
    setSearch('');
    setCallingAtCode(null);
    setShowDropdown(false);
};

return (
    <div className="search-stations-container" ref={containerRef}>
        <div className="search-input-wrapper">
            <input
                type="text"
                placeholder="Calling At..."
                value={search}
                onChange={handleInputChange}
                onFocus={() => search.length >= 3 && setShowDropdown(true)}
                className="station-search-input"
            />
            {search && (
                <button 
                    className="clear-search-btn"
                    onClick={clearSearch}
                    type="button"
                    aria-label="Clear search"
                >
                    ×
                </button>
            )}
        </div> 
        {showDropdown && search.length >= 3 && (
            <ul className="station-list">
                {filteredStations.length > 0 ? (
                    filteredStations.slice(0, 5).map(station => (
                        <li
                            key={station.crsCode}
                            className={selectedStation?.crsCode === station.crsCode ? 'selected' : ''}
                            onClick={() => setStation(station)}
                        >
                            {station.stationName} ({station.crsCode})
                        </li>
                    ))
                ) : (
                    <li className="no-results">No stations found</li>
                )}
            </ul>
        )}
        {search.length > 0 && search.length < 3 && !showDropdown && (
            <div className="search-hint">Type at least 3 characters to search</div>
        )}
    </div>
);

}

export default CallingAt;

