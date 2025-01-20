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
        console.log(
          'fetchedVideos',
          fetchedVideos.map((item) => ({ ...item }))
        );
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
      {/* Sidebar */}
      <Box width={300} bgcolor="black" color="white" p={2} position="relative">
        {/* Header */}
        <Box display="flex" alignItems="center" mb={4}>
          <CalendarMonth
            sx={{ fontSize: 20, color: 'white', padding: 1, mr: 1 }}
          />
          <Typography variant="h6" sx={{ fontSize: 20 }}>
            Content Scheduling
          </Typography>
        </Box>

        {/* Mini Calendar */}
        <MiniCalendar />

        {/* Video Preview */}
      
          {/* <Box mt={4} mb={4}>
            <Typography variant="subtitle2" mb={1}>
              Video Preview
            </Typography>
            <Box
              component="video"
              autoPlay
              a
              src={selectedVideo ? selectedVideo.file_url : ''} // Ensure the file URL is valid
              width="100%"
              sx={{
                borderRadius: '8px',
                border: '1px solid gray',
                overflow: 'hidden',
              }}
            />
          </Box> */}
          <VideoPreview selectedVideo={selectedVideo ? selectedVideo.file_url : null} />
      

        {/* Source Input Folders */}
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

          {/* File List */}
          {isLoading ? (
            <CircularProgress color="inherit" />
          ) : error ? (
            <Alert severity="error">{error}</Alert>
          ) : (
            <FileList videos={videos} onSelect={handleSelectVideo} />
          )}
        </Box>
      </Box>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </Box>
  );
};

export default Sidebar;
