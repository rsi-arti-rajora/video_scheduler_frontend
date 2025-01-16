import React, { useState, useRef } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Input,
  MenuItem,
  Select,
  Typography,
  CircularProgress,
} from '@mui/material';
import { PlayCircleOutline, Search, Add, ExpandMore, ExpandLess } from '@mui/icons-material';

const ContentSchedulerTest = () => {
  const [date, setDate] = useState(new Date());
  const [selectedChannel, setSelectedChannel] = useState('');
  const [lists, setLists] = useState([
    {
      id: 1,
      name: 'List Name 1',
      expanded: true,
      files: [
        { id: 1, name: 'Record-1.mp5' },
        { id: 2, name: 'Record-2.mp5', selected: true },
        { id: 3, name: 'Record-3.mp5' },
        { id: 4, name: 'Record-4.mp5' },
      ],
    },
    { id: 2, name: 'List Name 2', expanded: false, files: [] },
    { id: 3, name: 'List Name 3', expanded: false, files: [] },
    { id: 4, name: 'List Name 4', expanded: false, files: [] },
  ]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('video/')) {
      setUploadStatus('Please select a valid video file');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading...');

    try {
      // Simulate upload process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newVideo = {
        id: Date.now(),
        name: file.name,
        selected: true,
      };

      // Add to first list and set as selected
      setLists((prev) =>
        prev.map((list, index) => {
          if (index === 0) {
            return {
              ...list,
              expanded: true,
              files: list.files.map((f) => ({ ...f, selected: false })).concat(newVideo),
            };
          }
          return list;
        })
      );

      setSelectedVideo(URL.createObjectURL(file));
      setUploadStatus('Video uploaded successfully!');
      setShowUploadDialog(false);

      // Clear status after a delay
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      setUploadStatus('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const toggleList = (listId) => {
    setLists((prev) =>
      prev.map((list) =>
        list.id === listId ? { ...list, expanded: !list.expanded } : list
      )
    );
  };

  const selectVideo = (listId, fileId) => {
    setLists((prev) =>
      prev.map((list) => ({
        ...list,
        files: list.files.map((file) => {
          if (file && list.id === listId && file.id === fileId) {
            return { ...file, selected: true };
          }
          return { ...file, selected: false };
        }),
      }))
    );
  };  

  return (
    <Box display="flex" minHeight="100vh" bgcolor="gray.100">
      {/* Left Sidebar */}
      <Box width={300} bgcolor="black" color="white" p={2}>
        <Box display="flex" alignItems="center" mb={4}>
          <Box width={32} height={32} bgcolor="white" borderRadius="50%" mr={2}></Box>
          <Typography variant="h6">Content Scheduling</Typography>
        </Box>

        <Select
          value={selectedChannel}
          onChange={(e) => setSelectedChannel(e.target.value)}
          displayEmpty
          fullWidth
          variant="outlined"
          sx={{ bgcolor: 'gray.800', color: 'white', mb: 3 }}
        >
          <MenuItem value="" disabled>
            Select Channel
          </MenuItem>
          <MenuItem value="channel1">Channel 1</MenuItem>
          <MenuItem value="channel2">Channel 2</MenuItem>
        </Select>

        {/* Input Preview */}
        <Card sx={{ bgcolor: 'gray.900', color: 'white', mb: 3 }}>
          <CardHeader title="Input Preview" />
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Upload and List Management */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Source Input List</Typography>
            <Box>
              <Button onClick={() => setShowUploadDialog(true)} startIcon={<Add />} color="inherit">
                Add
              </Button>
            </Box>
          </Box>

          {lists.map((list) => (
            <Box key={list.id}>
              <Box
                display="flex"
                alignItems="center"
                onClick={() => toggleList(list.id)}
                sx={{ cursor: 'pointer', p: 1, '&:hover': { bgcolor: 'gray.800' } }}
              >
                {list.expanded ? <ExpandLess /> : <ExpandMore />}
                <Typography variant="body2">{list.name}</Typography>
              </Box>
              {list.expanded && (
                <Box pl={3}>
                  {list.files.map((file) => (
                    <Box
                      key={file.id}
                      p={1}
                      sx={{
                        bgcolor: file.selected ? 'purple' : 'transparent',
                        color: file.selected ? 'white' : 'inherit',
                        borderRadius: 1,
                        cursor: 'pointer',
                      }}
                      onClick={() => selectVideo(list.id, file.id)}
                    >
                      {file.name}
                    </Box>
                  ))}
                </Box>
              )}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onClose={() => setShowUploadDialog(false)}>
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
          <Button onClick={() => setShowUploadDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentSchedulerTest;
