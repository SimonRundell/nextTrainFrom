import React, {useEffect, useState} from 'react';
import axios from 'axios';


function useTrainData(stationCode, callingAtCode) {
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

    // Live API call (disabled for development)
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        let url = `https://transportapi.com/v3/uk/train/station/${stationCode}/live.json?app_id=${config.app_id}&app_key=${config.app_key}&darwin=true&train_status=passenger`;
        
        // Only add calling_at parameter if callingAtCode is provided and not empty
        if (callingAtCode && callingAtCode.trim().length >= 3) {
          url += `&calling_at=${callingAtCode}`;
        }
        
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
  }, [stationCode, callingAtCode, config.app_id, config.app_key]);

  return { data, loading, error };
}

export default useTrainData;