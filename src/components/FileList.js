import React from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator'; // Import drag indicator icon
import { useDrag } from 'react-dnd'; // Import drag hook
import { getKeyFromUrl } from './utils'; // Import getKeyFromUrl function

const DraggableListItem = ({ video, onSelect }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'VIDEO_FILE',
    item: { 
      type: 'VIDEO_FILE',
      id: video.id,
      file_name: video.file_name,
      duration: video.duration // Assuming video has duration property
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  });

  return (
    <ListItem
        key={video.id}
        selected={video.selected}
        onClick={() => onSelect(video.id)}
        sx={{
          bgcolor: video.selected ? 'primary.main' : 'transparent',
          color: 'white',
          mb: 1,
          borderRadius: '8px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            bgcolor: 'primary.light',
          },
        }}
        ref={drag} // Attach drag reference to ListItem
      >
      <ListItemText primary={video.file_name} sx={{ color: 'white' }} />
    </ListItem>
  );
};

const FileList = ({ videos, onSelect }) => {
  videos = videos.map((video) => ({ ...video, selected: false }));

  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Video Files
      </Typography>
      <List sx={{
        maxHeight: 400,  // Set max height of the list
        overflowY: 'auto', // Enable vertical scrolling
      }}>
        {videos.map((video,index) => (
          <DraggableVideoItem
            key={index}
            video={video}
            onSelect={onSelect}
          />
        ))}
      </List>
    </Box>
  );
};




const DraggableVideoItem = ({ video, onSelect }) => {
  // after .com is the key
  const key = getKeyFromUrl(video.file_url);
  const [, drag] = useDrag({
    type: 'video',
    item: { id: video.id, title: video.file_name, duration: video.duration,key },
  });

  return (
    <ListItem
      key={video.id}
      button
      selected={video.selected}
      onClick={() => onSelect(video.id)}
      sx={{
        bgcolor: video.selected ? 'primary.main' : 'transparent',
        color: 'white',
        mb: 1,
        borderRadius: '8px',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          bgcolor: 'primary.light',
        },
        display: 'flex',
        alignItems: 'center',
      }}
      ref={drag}
    >
      <DragIndicatorIcon sx={{ marginRight: 2, cursor: 'grab', color: 'white' }} />
      <ListItemText primary={video.file_name} sx={{ color: 'white' }} />
    </ListItem>
  );
};

export default FileList;