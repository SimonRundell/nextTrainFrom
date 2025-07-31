import React, {useEffect, useState} from 'react';
import axios from 'axios';

// Mock data for development - disable API calls
const MOCK_DATA = {
  "date": "2025-07-31",
  "time_of_day": "08:32",
  "request_time": "2025-07-31T08:32:40+01:00",
  "station_name": "Exeter St Davids",
  "station_code": "EXD",
  "departures": {
    "all": [
      {
        "mode": "train",
        "service": "25482001",
        "train_uid": "P09750",
        "platform": "3",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "08:33",
        "aimed_arrival_time": "08:29",
        "aimed_pass_time": null,
        "origin_name": "Exmouth",
        "destination_name": "Paignton",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P09750:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "ON TIME",
        "expected_arrival_time": "08:29",
        "expected_departure_time": "08:33",
        "best_arrival_estimate_mins": -4,
        "best_departure_estimate_mins": 0
      },
      {
        "mode": "train",
        "service": "25480001",
        "train_uid": "P09719",
        "platform": "1",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "08:36",
        "aimed_arrival_time": "08:35",
        "aimed_pass_time": null,
        "origin_name": "Barnstaple",
        "destination_name": "Exeter Central",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P09719:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "EARLY",
        "expected_arrival_time": "08:34",
        "expected_departure_time": "08:35",
        "best_arrival_estimate_mins": 1,
        "best_departure_estimate_mins": 2
      },
      {
        "mode": "train",
        "service": "25482001",
        "train_uid": "P09327",
        "platform": "3",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "08:39",
        "aimed_arrival_time": "08:37",
        "aimed_pass_time": null,
        "origin_name": "Exeter Central",
        "destination_name": "Okehampton",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P09327:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "ON TIME",
        "expected_arrival_time": "08:37",
        "expected_departure_time": "08:39",
        "best_arrival_estimate_mins": 4,
        "best_departure_estimate_mins": 6
      },
      {
        "mode": "train",
        "service": "25462001",
        "train_uid": "P08998",
        "platform": "1",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "08:46",
        "aimed_arrival_time": "08:42",
        "aimed_pass_time": null,
        "origin_name": "Paignton",
        "destination_name": "Exmouth",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P08998:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "EARLY",
        "expected_arrival_time": "08:41",
        "expected_departure_time": "08:45",
        "best_arrival_estimate_mins": 8,
        "best_departure_estimate_mins": 12
      },
      {
        "mode": "train",
        "service": "25397003",
        "train_uid": "P08309",
        "platform": "4",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "08:46",
        "aimed_arrival_time": "08:44",
        "aimed_pass_time": null,
        "origin_name": "London Paddington",
        "destination_name": "Penzance",
        "source": "Network Rail",
        "category": "XX",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P08309:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "EARLY",
        "expected_arrival_time": "08:43",
        "expected_departure_time": "08:45",
        "best_arrival_estimate_mins": 10,
        "best_departure_estimate_mins": 12
      },
      {
        "mode": "train",
        "service": "25467001",
        "train_uid": "P09868",
        "platform": "6",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "08:48",
        "aimed_arrival_time": null,
        "aimed_pass_time": null,
        "origin_name": "Exeter St Davids",
        "destination_name": "Cardiff Central",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P09868:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "STARTS HERE",
        "expected_arrival_time": null,
        "expected_departure_time": "08:48",
        "best_arrival_estimate_mins": null,
        "best_departure_estimate_mins": 15
      },
      {
        "mode": "train",
        "service": "25482001",
        "train_uid": "P09752",
        "platform": "3",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "09:00",
        "aimed_arrival_time": "08:56",
        "aimed_pass_time": null,
        "origin_name": "Exmouth",
        "destination_name": "Paignton",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P09752:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "LATE",
        "expected_arrival_time": "08:56",
        "expected_departure_time": "09:00",
        "best_arrival_estimate_mins": 23,
        "best_departure_estimate_mins": 27
      },
      {
        "mode": "train",
        "service": "25480001",
        "train_uid": "P09702",
        "platform": "1",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "09:02",
        "aimed_arrival_time": "09:00",
        "aimed_pass_time": null,
        "origin_name": "Okehampton",
        "destination_name": "Exeter Central",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P09702:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "ON TIME",
        "expected_arrival_time": "09:00",
        "expected_departure_time": "09:02",
        "best_arrival_estimate_mins": 27,
        "best_departure_estimate_mins": 29
      },
      {
        "mode": "train",
        "service": "22180013",
        "train_uid": "C23729",
        "platform": "4",
        "operator": "XC",
        "operator_name": "CrossCountry",
        "aimed_departure_time": "09:12",
        "aimed_arrival_time": "09:08",
        "aimed_pass_time": null,
        "origin_name": "Birmingham New Street",
        "destination_name": "Paignton",
        "source": "Network Rail",
        "category": "XX",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/C23729:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "ON TIME",
        "expected_arrival_time": "09:08",
        "expected_departure_time": "09:12",
        "best_arrival_estimate_mins": 35,
        "best_departure_estimate_mins": 39
      },
      {
        "mode": "train",
        "service": "25462001",
        "train_uid": "P08999",
        "platform": "1",
        "operator": "GW",
        "operator_name": "Great Western Railway",
        "aimed_departure_time": "09:16",
        "aimed_arrival_time": "09:09",
        "aimed_pass_time": null,
        "origin_name": "Paignton",
        "destination_name": "Exmouth",
        "source": "Network Rail",
        "category": "OO",
        "service_timetable": {
          "id": "https://transportapi.com/v3/uk/train/service_timetables/P08999:2025-07-31.json?app_id=ab91d8f5&app_key=772a925251c07b3a3a7ae68b0cb09075&live=true"
        },
        "status": "ON TIME",
        "expected_arrival_time": "09:09",
        "expected_departure_time": "09:16",
        "best_arrival_estimate_mins": 36,
        "best_departure_estimate_mins": 43
      }
    ]
  }
};

// Set this to true to use live API, false to use mock data
const USE_LIVE_API = true;

function useTrainData(stationCode) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
const [config, setConfig] = useState({ app_id: '', app_key: '' });

useEffect(() => {
    // Load config from .config.json
    fetch('/.config.json')
        .then(res => res.json())
        .then(cfg => setConfig(cfg))
        .catch(() => setConfig({ app_id: '', app_key: '' }));
}, []);

  useEffect(() => {
    if (!stationCode || stationCode.length < 3) {
      setData(null);
      return;
    }

    if (!USE_LIVE_API) {
      // Use mock data for development
      setLoading(true);
      setTimeout(() => {
        setData(MOCK_DATA);
        setLoading(false);
      }, 500); // Simulate API delay
      return;
    }

    // Live API call (disabled for development)
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const url = `https://transportapi.com/v3/uk/train/station/${stationCode}/live.json?app_id=${config.app_id}&app_key=${config.app_key}&darwin=true&train_status=passenger`;
        const response = await axios.get(url);
        setData(response.data);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError(error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [stationCode]);

  return { data, loading, error };
}

export default useTrainData;