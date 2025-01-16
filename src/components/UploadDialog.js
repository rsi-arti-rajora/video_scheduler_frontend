import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogTitle, Input, Button, CircularProgress, Typography, Box } from '@mui/material';

const UploadDialog = ({ isOpen, isUploading, uploadStatus, fileInputRef, handleFileUpload, onClose }) => {
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle>Upload Video</DialogTitle>
      <DialogContent>
        <Input type="file" inputRef={fileInputRef} onChange={handleFileUpload} fullWidth />
        {isUploading && (
          <Box display="flex" alignItems="center" mt={2}>
            <CircularProgress size={20} sx={{ mr: 1 }} />
            <Typography variant="body2">Uploading...</Typography>
          </Box>
        )}
        {uploadStatus && <Typography variant="body2">{uploadStatus}</Typography>}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
