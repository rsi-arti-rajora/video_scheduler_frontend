import React, { useState, useRef } from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography,
  Button,
  IconButton,
  styled 
} from '@mui/material';
import { PlayCircle, CloudUpload, Close } from '@mui/icons-material';

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

const UploadContainer = styled(Box)({
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(0, 0, 0, 0.6)',
  color: 'white'
});

const UploadButton = styled(Button)({
  marginTop: '16px',
  backgroundColor: '#dc2626',
  color: 'white',
  '&:hover': {
    backgroundColor: '#b91c1c'
  }
});

const PreviewImage = styled('img')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const VideoPlayer = styled('video')({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover'
});

const RemoveButton = styled(IconButton)({
  position: 'absolute',
  top: '8px',
  right: '8px',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  color: 'white',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.7)'
  }
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1
});

const PreviewUI = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isVideo, setIsVideo] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      
      // Check if the file is a video
      const isVideoFile = file.type.startsWith('video/');
      setIsVideo(isVideoFile);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setUploadedFile(null);
    setPreviewUrl(null);
    setIsVideo(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Grid container spacing={3}>
      <Grid item xs={1} md={3}></Grid>
        {/* Output Preview */}
        <Grid item xs={12} md={5}>
          <PreviewCard>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Output Preview
            </Typography>
            <PreviewContent>
  {previewUrl && (
    <PreviewImage 
      src={previewUrl} 
      alt="Preview"
      style={{ opacity: 0.5 }}
    />
  )}
  <PlayCircle 
    sx={{
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      fontSize: 64,
      color: '#ff5722', // Default color of the play icon
      cursor: 'pointer',
      '&:hover': {
        color: '#e64a19' // Hover color
      }
    }}
  />
</PreviewContent>

          </PreviewCard>
        </Grid>
      </Grid>
    </Box>
  );
};

export default PreviewUI;
