import React from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useDrag } from 'react-dnd';

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
      ref={drag}
      button
      selected={video.selected}
      onClick={() => onSelect(video.id)}
      sx={{
        bgcolor: video.selected ? 'primary.main' : 'transparent',
        color: 'white',
        mb: 1,
        borderRadius: '8px',
        transition: 'all 0.2s ease-in-out',
        opacity: isDragging ? 0.5 : 1,
        cursor: 'move',
        '&:hover': {
          bgcolor: 'primary.light',
        },
      }}
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
      <List>
        {videos.map((video) => (
          <DraggableListItem 
            key={video.id} 
            video={video} 
            onSelect={onSelect}
          />
        ))}
      </List>
    </Box>
  );
};

export default FileList;