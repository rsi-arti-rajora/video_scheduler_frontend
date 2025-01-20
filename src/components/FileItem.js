import React from 'react';
import { Box, Typography } from '@mui/material';

const FileItem = ({ file, onSelect }) => {
  return (
    <Box
      p={1}
      sx={{
        bgcolor: file.selected ? 'purple' : 'transparent',
        color: file.selected ? 'white' : 'inherit',
        borderRadius: 1,
        cursor: 'pointer',
      }}
      onClick={onSelect}
    >
      {file.file_name}
    </Box>
  );
};

export default FileItem;
