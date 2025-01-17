// components/UploadDialog.js
import React from 'react';
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress
} from '@mui/material';

const UploadDialog = ({ 
  isOpen, 
  isUploading, 
  uploadStatus, 
  fileInputRef, 
  handleFileUpload, 
  onClose 
}) => {
  return (
    <Dialog open={isOpen} onClose={!isUploading ? onClose : undefined}>
      <DialogTitle>Upload Video</DialogTitle>
      <DialogContent>
        <Box p={2}>
          <input
            type="file"
            accept="video/*"
            onChange={handleFileUpload}
            ref={fileInputRef}
            disabled={isUploading}
            style={{ display: 'none' }}
            id="video-upload-input"
          />
          <Button
            variant="contained"
            component="label"
            disabled={isUploading}
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Video File
          </Button>
          {uploadStatus && (
            <Typography 
              color={uploadStatus.includes('failed') ? 'error' : 'textPrimary'}
              style={{ marginTop: '1rem' }}
            >
              {uploadStatus}
            </Typography>
          )}
          {isUploading && (
            <Box mt={2} display="flex" justifyContent="center">
              <CircularProgress size={24} />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button 
          onClick={onClose} 
          disabled={isUploading}
          color="inherit"
        >
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;