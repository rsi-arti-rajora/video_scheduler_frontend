import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  CircularProgress,
  Alert,
  Button,
} from '@mui/material';
import { Add, CalendarMonth } from '@mui/icons-material';

import UploadDialog from './UploadDialog';
import FileList from './FileList';
import MiniCalendar from './MiniCalendar';
import apiService from '../services/apiService';
import VideoPreview from './VideoPreview';

const Sidebar = () => {
  const [videos, setVideos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
  }, [showUploadDialog]);

  const handleSelectVideo = (videoId) => {
    setVideos((prev) =>
      prev.map((video) => ({
        ...video,
        selected: video.id === videoId,
      }))
    );
    const selected = videos.find((video) => video.id === videoId);
    setSelectedVideo(selected || null);
  };

  const handleUploadSuccess = (newVideo) => {
    setVideos((prev) => [...prev, newVideo]);
    setShowUploadDialog(false);
  };

  return (

      <Box display="flex" minHeight="100vh" bgcolor="gray.100">
        <Box width={300} bgcolor="black" color="white" p={2} position="relative">
          <Box display="flex" alignItems="center" mb={4}>
            <CalendarMonth sx={{ fontSize: 20, color: 'white', padding: 1, mr: 1 }} />
            <Typography variant="h6" sx={{ fontSize: 20 }}>
              Content Scheduling
            </Typography>
          </Box>

          <MiniCalendar />

          <VideoPreview selectedVideo={selectedVideo ? selectedVideo.file_url : null} />

          <Box>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography variant="subtitle2">Source Input Folders</Typography>
              <Button
                onClick={() => setShowUploadDialog(true)}
                startIcon={<Add />}
                color="inherit"
                sx={{
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': { bgcolor: 'primary.dark' },
                }}
              >
                Add
              </Button>
            </Box>

            {isLoading ? (
              <CircularProgress color="inherit" />
            ) : error ? (
              <Alert severity="error">{error}</Alert>
            ) : (
              <FileList videos={videos} onSelect={handleSelectVideo} />
            )}
          </Box>
        </Box>

        <UploadDialog
          isOpen={showUploadDialog}
          onClose={() => setShowUploadDialog(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      </Box>
   
  );
};

export default Sidebar;
