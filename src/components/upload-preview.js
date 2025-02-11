import React, { useEffect, useRef, useState } from "react";
import { Box, Grid, Paper, Typography, styled, Button, TextField } from "@mui/material";
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
  const [hlsUrl, setHlsUrl] = useState(getNewHlsUrl());
  const [isStreamAvailable, setIsStreamAvailable] = useState(true);
  const [showHlsUrl, setShowHlsUrl] = useState(false);
  const videoRef = useRef(null);
  const hlsRef = useRef(null); // Store HLS instance
  const pollingInterval = useRef(null);

  function getNewHlsUrl() {
    return `https://f53112b70bc31005.mediapackage.ap-south-1.amazonaws.com/out/v1/43e8b8ccd16945efa916d5da03075a02/index.m3u8?timestamp=${new Date().getTime()}&random=${Math.random()}`;
  }

  const restartStream = async () => {
    try {
      await apiService.restartStream();
      toast.success("Stream restarted successfully!");
      const newUrl = getNewHlsUrl();
      setHlsUrl(newUrl);
      setShowHlsUrl(true);
      reloadHlsStream(newUrl); // Reload the HLS stream with the new URL
    } catch (error) {
      console.error("Error restarting the stream:", error);
      toast.error("Failed to restart the stream.");
    }
  };

  const reloadHlsStream = (url) => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
  }
  if (videoRef.current) {
    videoRef.current.src = "";
    videoRef.current.load();
}

  
    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        setIsStreamAvailable(true);
        stopPolling();
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.type === "networkError") {
          console.error("Stream unavailable. Starting polling...");
          setIsStreamAvailable(false);
          startPolling();
        }
      });

      hlsRef.current = hls; // Store the new HLS instance
    } else if (videoRef.current?.canPlayType("application/vnd.apple.mpegurl")) {
      const videoElement = videoRef.current;
      videoElement.src = url;

      videoElement.addEventListener("loadedmetadata", () => {
        setIsStreamAvailable(true);
        stopPolling();
      });

      videoElement.addEventListener("error", () => {
        console.error("Stream error. Starting polling...");
        setIsStreamAvailable(false);
        startPolling();
      });
    }
  };

  const stopPolling = () => {
    if (pollingInterval.current) {
      clearInterval(pollingInterval.current);
      pollingInterval.current = null;
    }
  };

  const startPolling = () => {
    if (!pollingInterval.current) {
      pollingInterval.current = setInterval(() => {
        console.log("Checking stream availability...");
        reloadHlsStream(hlsUrl); // Reload the stream to check availability
      }, 5000); // Check every 5 seconds
    }
  };

  useEffect(() => {
    // Initial stream setup
    reloadHlsStream(hlsUrl);

    // Cleanup on unmount
    return () => {
      stopPolling();
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
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
                muted
                style={{
                  display: isStreamAvailable ? "block" : "none",
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
            {showHlsUrl && (
              <Box sx={{ mt: 2 }}>
                <TextField
                  fullWidth
                  variant="outlined"
                  value={hlsUrl}
                  InputProps={{
                    readOnly: true,
                  }}
                />
              </Box>
            )}
            <Box sx={{ mt: 2, textAlign: "center" }}>
              <Button
                variant="contained"
                color="primary"
                onClick={restartStream}
              >
                Publish
              </Button>
            </Box>
          </PreviewCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreviewUI;
