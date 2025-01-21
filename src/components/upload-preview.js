import React, { useEffect, useRef, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  styled,
  Button
} from '@mui/material';
import { PlayCircle } from '@mui/icons-material';
import Hls from 'hls.js';
import apiService from '../services/apiService';
import { toast } from 'react-toastify';

// Styled components
const PreviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: '100%',
  backgroundColor: 'white',
  borderRadius: '8px',
  boxShadow: theme.shadows[3]
}));

const PreviewContent = styled(Box)({
  position: 'relative',
  width: '100%',
  paddingTop: '56.25%', // 16:9 aspect ratio
  borderRadius: '8px',
  overflow: 'hidden',
  backgroundColor: '#1a1a1a'
});

const VideoPlayer = styled('video')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  borderRadius: '8px'
});

const PreviewUI = () => {
  const [hlsUrl, setHlsUrl] = useState(`https://tvunativeoverlay.s3.ap-south-1.amazonaws.com/hls/master.m3u8?timestamp=${new Date().getTime()}`);
  const videoRef = useRef(null);

  // Function to restart the stream by fetching a new URL or resetting the current one
  const restartStream = async () => {
    try {
      /// start-ffmpeg-stream
      await apiService.restartStream();
      toast.success('Stream restarted successfully!');
      
    } catch (error) {
      console.error('Error restarting the stream:', error);
    }
  };

  useEffect(() => {
    if (videoRef.current && Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        videoRef.current.play().catch((err) => {
          console.error('Autoplay failed:', err);
        });
      });

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current?.canPlayType('application/vnd.apple.mpegurl')) {
      // For Safari
      videoRef.current.src = hlsUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        videoRef.current.play().catch((err) => {
          console.error('Autoplay failed:', err);
        });
      });
    }
  }, [hlsUrl]);

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
        <Grid item xs={1} md={3}></Grid>
        <Grid item xs={12} md={5}>
          <PreviewCard>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Scheduled Output Preview
            </Typography>
            <PreviewContent>
              <VideoPlayer
                ref={videoRef}
                controls
                autoPlay
                muted // Mute the video to enable autoplay
              />
              <PlayCircle
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  fontSize: 64,
                  color: '#ff5722',
                  display: 'none', // Play icon hidden because of autoplay
                }}
              />
            </PreviewContent>
            <Box sx={{ mt: 2, textAlign: 'center' }}>
              <Button variant="contained" color="primary" onClick={restartStream}>
                Restart Stream
              </Button>
            </Box>
          </PreviewCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreviewUI;
