import React, { useState, useContext } from 'react';
import { Box, Typography, CircularProgress, Alert, Button } from '@mui/material';
import { Add } from '@mui/icons-material';

import UploadDialog from './UploadDialog';
import FileList from './FileList';
import VideoPreview from './VideoPreview';
import { VideosContext } from '../contexts/VideosContext';

const Sidebar = () => {
  const { videos, setVideos, isLoading, error } = useContext(VideosContext);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

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
        <VideoPreview selectedVideo={selectedVideo ? selectedVideo.file_url : null} />
        <Box>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle2">Source Input Folders</Typography>
            <Button
              onClick={() => setShowUploadDialog(true)}
              startIcon={<Add />}
              color="inherit"
              sx={{
                bgcolor: '#0abf53',
                color: 'white',
                '&:hover': { bgcolor: '#089f43' },
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
