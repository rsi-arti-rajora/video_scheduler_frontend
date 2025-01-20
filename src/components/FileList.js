import React from 'react';
import { Box, List, ListItem, ListItemText, Typography } from '@mui/material';

const FileList = ({ videos, onSelect }) => {
  videos = videos.map((video) => ({ ...video, selected: false }));
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ mb: 2 }}>
        Video Files
      </Typography>
      <List>
        {videos.map((video) => (
          <ListItem
            key={video.id}
            button
            selected={video.selected}
            onClick={() => onSelect(video.id)}
            sx={{
              bgcolor: video.selected ? 'primary.main' : 'transparent',
              color: 'white', // Ensure text color is always white
              mb: 1,
              borderRadius: '8px',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                bgcolor: 'primary.light',
              },
            }}
          >
            <ListItemText primary={video.file_name} sx={{ color: 'white' }} /> {/* Ensure ListItemText is white */}
          </ListItem>
        ))}
      </List>
    </Box>
  );
};

export default FileList;
