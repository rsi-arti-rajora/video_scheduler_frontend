import React, { useState, useRef } from 'react';
import { Box, Button, Select, MenuItem, Typography } from '@mui/material';
import FileList from './FileList'; // Assuming FileList handles individual list rendering
import UploadDialog from './UploadDialog';
import VideoPreview from './VideoPreview';
import { Add } from '@mui/icons-material';
import { CalendarMonth } from '@mui/icons-material';

const Sidebar = () => {
  const [selectedChannel, setSelectedChannel] = useState('');
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
    },
    {
      id: 2,
      name: 'ListName 2',
      expanded: false,
      files: [
        { id: 1, name: 'File-1.mp4' },
        { id: 2, name: 'File-2.mp4' },
      ],
    },
    {
      id: 3,
      name: 'ListName 3',
      expanded: false,
      files: [
        { id: 1, name: 'File-1.mp4' },
        { id: 2, name: 'File-2.mp4' },
      ],
    },
    {
      id: 4,
      name: 'ListName 4',
      expanded: false,
      files: [
        { id: 1, name: 'File-1.mp4' },
        { id: 2, name: 'File-2.mp4' },
      ],
    }
  ]);

  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const fileInputRef = useRef(null);
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

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
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newVideo = {
        id: Date.now(),
        name: file.name,
        selected: true,
      };

      setLists((prev) =>
        prev.map((list) => {
          if (list.id === 1) { // Always add to Folder 1 for this example
            return {
              ...list,
              expanded: true,
              files: [...list.files, newVideo],
            };
          }
          return list;
        })
      );

      setSelectedVideo(URL.createObjectURL(file));
      setUploadStatus('Video uploaded successfully!');
      setShowUploadDialog(false);

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

  return (
    <Box display="flex" minHeight="100vh" bgcolor="gray.100">
      
      <Box width={300} bgcolor="black" color="white" p={2}>
        <Box display="flex" alignItems="center" mb={4} >
          {/* Calendar Icon */}
          <CalendarMonth sx={{ fontSize: 20, color: 'white', padding: 1, mr: 1 }} />
          
          <Typography variant="h6"  sx={{ fontSize: 20}}>Content Scheduling</Typography>
        </Box>

        <div className="mini-calendar">
          <div className="mini-calendar-grid">
            {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
              <div key={day} className="mini-calendar-day">{day}</div>
            ))}
            {days.map(day => (
              <div key={day} className={`mini-calendar-day ${day === 14 ? 'active' : ''}`}>
                {day}
              </div>
            ))}
          </div>
        </div>
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
  );
};

export default Sidebar;
