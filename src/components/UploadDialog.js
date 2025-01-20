import React, { useState } from "react";
import {
  Box,
  Button,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  LinearProgress,
} from "@mui/material";
import apiService from "../services/apiService.js"; // Import upload API service

const UploadDialog = ({ isOpen, onClose }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState("");
  const fileInputRef = React.createRef();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setSelectedFile(file);
    setUploadStatus("");
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setUploadProgress(0);
    setUploadStatus("");

    try {
      // Start the upload process using the service
      await apiService.uploadFile(selectedFile, (progress) => {
        setUploadProgress(progress); // Update progress percentage
      });
      // Once upload is successful, call the addMetadata API
      const metadata = {
        file_name: selectedFile.name,
      };

      await apiService.addMetadata(metadata); // Call the addMetadata API

      setUploadStatus("Upload successful!");
    } catch (error) {
      console.error("Upload failed:", error);
      setUploadStatus(`${error.response?.data?.error || "Upload failed!"}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={isOpen} onClose={!isUploading ? onClose : undefined}>
      <DialogTitle>Upload Video</DialogTitle>
      <DialogContent>
        <Box p={2}>
          {/* Hidden file input */}
          <input
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            ref={fileInputRef}
            style={{ display: "none" }}
            id="video-upload-input"
          />
          {/* File selection button */}
          <Button
            variant="contained"
            component="label"
            disabled={isUploading}
            fullWidth
            onClick={() => fileInputRef.current?.click()}
          >
            Choose Video File
          </Button>
          {selectedFile && (
            <Typography variant="body2" sx={{ mt: 1 }}>
              Selected File: {selectedFile.name}
            </Typography>
          )}
          {/* Upload progress */}
          {isUploading && (
            <Box mt={2}>
              <LinearProgress variant="determinate" value={uploadProgress} />
              <Typography align="center" sx={{ mt: 1 }}>
                {`Uploading: ${Math.round(uploadProgress)}%`}
              </Typography>
            </Box>
          )}
          {/* Upload status */}
          {uploadStatus && (
            <Typography
              color={uploadStatus.includes("failed") ? "error" : "success.main"}
              style={{ marginTop: "1rem" }}
            >
              {uploadStatus}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        {/* Upload button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || isUploading}
          variant="contained"
          color="primary"
        >
          Upload
        </Button>
        {/* Cancel button */}
        <Button onClick={onClose} disabled={isUploading} color="inherit">
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UploadDialog;
