import React from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import { ExpandMore, ExpandLess } from '@mui/icons-material';
import FileItem from './FileItem'; // Assuming FileItem renders individual files

const FileList = ({ list, onToggle, onSelect }) => {
  return (
    <Box>
      <Box
        display="flex"
        alignItems="center"
        onClick={() => onToggle(list.id)}
        sx={{ cursor: 'pointer', p: 1, '&:hover': { bgcolor: 'gray.800' } }}
      >
        {list.expanded ? <ExpandLess /> : <ExpandMore />}
        <Typography variant="body2">{list.name}</Typography>
      </Box>

      {list.expanded && (
        <Box pl={3}>
          {list.files.map((file) => (
            <FileItem key={file.id} file={file} onSelect={() => onSelect(list.id, file.id)} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default FileList;
