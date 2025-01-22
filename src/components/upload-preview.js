import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, Paper, Typography, styled, Button } from "@mui/material";
import { PlayCircle } from "@mui/icons-material";
import Hls from "hls.js";
import apiService from "../services/apiService";
import { toast } from "react-toastify";

// Styled components
const PreviewCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  height: "100%",
  backgroundColor: "white",
  borderRadius: "8px",
  boxShadow: theme.shadows[3],
}));

const PreviewContent = styled(Box)({
  position: "relative",
  width: "100%",
  paddingTop: "56.25%", // 16:9 aspect ratio
  borderRadius: "8px",
  overflow: "hidden",
  backgroundColor: "#1a1a1a",
});

const VideoPlayer = styled("video")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "8px",
});

const FallbackImage = styled("img")({
  position: "absolute",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  borderRadius: "8px",
  backgroundColor: "#1a1a1a",
});

const PreviewUI = () => {
  const [hlsUrl, setHlsUrl] = useState(
    `https://tvunativeoverlay.s3.ap-south-1.amazonaws.com/hls/master.m3u8?timestamp=${new Date().getTime()}`
  );
  const [isStreamAvailable, setIsStreamAvailable] = useState(true); // Tracks if the stream is available
  const videoRef = useRef(null);
  const pollingInterval = useRef(null); // Ref for the polling interval

  const restartStream = async () => {
    try {
      await apiService.restartStream();
      toast.success("Stream restarted successfully!");
      setHlsUrl(
        `https://tvunativeoverlay.s3.ap-south-1.amazonaws.com/hls/master.m3u8?timestamp=${new Date().getTime()}`
      );
    } catch (error) {
      console.error("Error restarting the stream:", error);
    }
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
      console.log("Polling stopped");
    }
  };

  const startPolling = () => {
    if (!pollingInterval.current) {
      pollingInterval.current = setInterval(() => {
        console.log("Checking stream availability...");
        checkStreamAvailability();
      }, 1000); // Check every 15 seconds
      console.log("Polling started");
    }
  };

  const checkStreamAvailability = () => {
    if (!videoRef.current) {
      console.warn('Video element is not attached yet. Retrying...');
      return;
    }

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(hlsUrl);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsStreamAvailable(true);
        stopPolling(); // Stop polling if the stream is playing
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.type === "networkError") {
          console.log("1 Stream stopped. Resuming polling...");
          setIsStreamAvailable(false);
          startPolling(); // Start polling again when the stream stops
        }
      });
     

       // Detect stream completion
      
      hls.attachMedia(videoRef.current);

      return () => {
        hls.destroy();
      };
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      const videoElement = videoRef.current;
      videoElement.src = hlsUrl;

      videoElement.addEventListener("loadedmetadata", () => {
        setIsStreamAvailable(true);
        stopPolling(); // Stop polling if the stream is playing
      });

      videoElement.addEventListener("error", () => {
        console.log("2 Stream stopped. Resuming polling...");
        setIsStreamAvailable(false);
        startPolling(); // Start polling again when the stream stops
      });
    }
  };

  useEffect(() => {
    // Ensure the video element is available before checking stream
    const interval = setInterval(() => {
      if (videoRef.current) {
        clearInterval(interval);
        checkStreamAvailability();
        startPolling(); // Start polling on mount
      }
    }, 1000);

    // Cleanup on component unmount
    return () => {
      stopPolling();
      clearInterval(interval);
    };
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
                style={{
                  display: isStreamAvailable ? "block" : "none", // Hide the video when the stream is unavailable
                }}
              />
              {!isStreamAvailable && (
                <FallbackImage
                  src="https://via.placeholder.com/800x450.png?text=No+Content+Scheduled"
                  alt="No content scheduled"
                />
              )}
              <PlayCircle
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: 64,
                  color: "#ff5722",
                  display: isStreamAvailable ? "none" : "block",
                }}
              />
            </PreviewContent>
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={restartStream}
              >
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
