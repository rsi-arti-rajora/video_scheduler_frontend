import React, { createContext, useState, useEffect } from 'react';
import apiService from '../services/apiService';

// Create the context
export const VideosContext = createContext();

// Create a provider component
export const VideosProvider = ({ children }) => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true);
      try {
        const fetchedVideos = await apiService.fetchMetadata();
        setVideos(fetchedVideos);
      } catch (err) {
        setError('Failed to fetch videos from S3 bucket.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  return (
    <VideosContext.Provider value={{ videos, setVideos, isLoading, error }}>
      {children}
    </VideosContext.Provider>
  );
};
