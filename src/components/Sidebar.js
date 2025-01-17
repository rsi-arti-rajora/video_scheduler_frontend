import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import { Add } from '@mui/icons-material';
import useVideoUpload from '../hooks/useVideoUpload';
import UploadDialog from './UploadDialog';
import { CalendarMonth } from '@mui/icons-material';
import FileList from './FileList'; // Assuming FileList handles individual list rendering
import VideoPreview from './VideoPreview';
import MiniCalendar from './MiniCalendar';
const Sidebar = () => {
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);

  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const [lists, setLists] = useState([
    {
      id: 1,
      name: 'ListName 1',
      expanded: true,
      files: [
        { id: 1, name: 'File-1.mp4' },
        { id: 2, name: 'File-2.mp4', selected: true },
        { id: 3, name: 'File-3.mp4' },
      ],
    }
  ]);
  const { fileInputRef, isUploading, uploadStatus, handleFileUpload } = useVideoUpload(); // Use the handleFileUpload from the hook
  const toggleList = (listId) => {
    setLists((prev) =>
      prev.map((list) => (list.id === listId ? { ...list, expanded: !list.expanded } : list))
    );
  };

  const selectVideo = (listId, fileId) => {
    setLists((prev) =>
      prev.map((list) => ({
        ...list,
        files: list.files.map((file) => ({
          ...file,
          selected: list.id === listId && file.id === fileId,
        })),
      }))
    );
  };
  const handleUploadSuccess = (fileUrl, file) => {
    const newVideo = {
      id: Date.now(),
      name: file.name,
      selected: true,
      url: fileUrl,
    };

    setLists((prev) =>
      prev.map((list) => {
        if (list.id === 1) {
          return {
            ...list,
            expanded: true,
            files: [...list.files, newVideo],
          };
        }
        return list;
      })
    );

    setShowUploadDialog(false);
  };

  return (
    <>
     <Box display="flex" minHeight="100vh" bgcolor="gray.100">
      
      <Box width={300} bgcolor="black" color="white" p={2}>
        <Box display="flex" alignItems="center" mb={4} >
          {/* Calendar Icon */}
          <CalendarMonth sx={{ fontSize: 20, color: 'white', padding: 1, mr: 1 }} />
          
          <Typography variant="h6"  sx={{ fontSize: 20}}>Content Scheduling</Typography>
        </Box>

        <MiniCalendar />
        <div className="preview-grid">
          <div className="preview-card">
            <h2 className="preview-title">Input Preview</h2>
            <div className="preview-content">
            <VideoPreview selectedVideo={selectedVideo} />
            </div>
          </div>
        </div>
        
        {/* Upload and Folder Management */}
        <Box mb={3}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
            <Typography variant="subtitle2">Source Input Folders</Typography>
            <Box>
              <Button onClick={() => setShowUploadDialog(true)} startIcon={<Add />} color="inherit">
                Add
              </Button>
            </Box>
          </Box>

          {lists.map((list) => (
            <FileList key={list.id} list={list} onToggle={toggleList} onSelect={selectVideo} />
          ))}
        </Box>
      </Box>

      {/* Upload Dialog */}
      <UploadDialog
        isOpen={showUploadDialog}
        isUploading={isUploading}
        uploadStatus={uploadStatus}
        fileInputRef={fileInputRef}
        handleFileUpload={handleFileUpload}
        onClose={() => setShowUploadDialog(false)}
      />
    </Box>
      {/* <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Typography variant="subtitle2">Source Input Folders</Typography>
        <Box>
          <Button 
            onClick={() => setShowUploadDialog(true)} 
            startIcon={<Add />} 
            color="inherit"
          >
            Add
          </Button>
        </Box>
      </Box> */}

      {/* <UploadDialog
        isOpen={showUploadDialog}
        isUploading={isUploading}
        uploadStatus={uploadStatus}
        fileInputRef={fileInputRef}
        handleFileUpload={async (event) => {
          const file = event.target.files?.[0];
          if (file) {
            try {
              const fileUrl = await handleFileUpload(event); // Use the handleFileUpload function from the hook
              handleUploadSuccess(fileUrl, file); // Handle success
            } catch (error) {
              // Handle error (if needed)
            }
          }
        }}
        onClose={() => setShowUploadDialog(false)}
      /> */}
    </>
  );
};

export default Sidebar;
