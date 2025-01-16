import React from 'react';
import { Box } from '@mui/material';
import { PlayCircleOutline } from '@mui/icons-material';

const VideoPreview = ({ selectedVideo }) => {
  return (
    <Box position="relative" width="100%" height={180} bgcolor="gray.800" borderRadius={2}>
      {selectedVideo ? (
        <video src={selectedVideo} controls style={{ width: '100%', height: '100%' }} />
      ) : (
        <PlayCircleOutline
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            fontSize: 50,
          }}
        />
      )}
    </Box>
  );
};

export default VideoPreview;


