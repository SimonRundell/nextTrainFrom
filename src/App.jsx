import { useState } from 'react'
import { MantineProvider } from '@mantine/core';
import useTrainData from './data.jsx';
import TrainDetails from './trainDetails.jsx';
import { InfoIcon, getStatusIcon, getOperatorIcon, BritishRailLogo } from './icons.jsx';
import SearchStations from './searchStations.jsx';
import CMFloatAd from './cmFloatAd.jsx';


function App() {
  
  const [stationCode, setStationCode] = useState(''); // Default station code
  const [selectedTrain, setSelectedTrain] = useState(null); // Track which train is selected
  const { data, loading, error } = useTrainData(stationCode);

  // Helper to format date as dd/mm/yyyy
  function formatDate(dateStr) {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  }

  // Handle train selection
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
          <SearchStations setStationCode={setStationCode}/>
        </div>
        
        {loading && <div className="spinner"></div>}
        {error && <p>Error loading data: {error.message}</p>}
        {data && (
          <div className="main-content">
            <h3>
              {data.station_name} ({data.station_code}) as of {formatDate(data.date)} {data.time_of_day}
            </h3>
            <div className="train-list">
            <ul>
              {data.departures.all.map((train, index) => (
                <div key={index}>
                  <li 
                    style={{'--item-index': index}}
                    onClick={() => handleTrainClick(index)}
                    className={`train-item ${selectedTrain === index ? 'selected' : ''}`}
                  >
                    <span className="column1"><strong>Platform {train.platform}:</strong> <span className="leftgap"></span>{train.aimed_departure_time} to {train.destination_name}</span>
                    <span className="column2">{getOperatorIcon(train.operator)} <span className="leftgap">{train.operator_name}</span></span>
                    <span className="column2">
                      {getStatusIcon(train.status, "0.9em")}
                      <span className={`status-${train.status.toLowerCase().replace(' ', '-')}`}>
                        {train.status}
                      </span>
                    </span>
                    <span className="column2">{train.best_departure_estimate_mins !== null && (
                      <span className="leftgap">Due in {train.best_departure_estimate_mins} mins</span>
                    )
                    }</span>
                    <span className="leftgap click-indicator"><InfoIcon /></span>
                  </li>
                  {selectedTrain === index && (
                    <TrainDetails train={{...train, index}} />
                  )}
                </div>
              ))}
            </ul>
          </div>
          </div>
        )}
        <CMFloatAd color='#ffffff' />
      </>
    </MantineProvider>
  )
}

export default App
