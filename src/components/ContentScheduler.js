import {React, useState} from 'react';
import Sidebar from './Sidebar';
import TimeLine from './timeline';
import PreviewUI from './upload-preview';
import { DndProvider } from 'react-dnd'; // Import DndProvider
import { HTML5Backend } from 'react-dnd-html5-backend'; // Import HTML5Backend
import { CalendarMonth } from '@mui/icons-material';
import { Box, Typography} from '@mui/material';
import MiniCalendar from './MiniCalendar';

const ContentScheduler = () => {
  const [selectedDay, setSelectedDay] = useState(new Date()); // Shared state b/w components
  return (
    <DndProvider backend={HTML5Backend}> {/* Wrap everything in one DndProvider */}
      <div className="scheduler-container">
        <div>
          <Box width={300} bgcolor="black" color="white" p={2} position="relative">
            <Box display="flex" alignItems="center" mb={4}>
              <CalendarMonth sx={{ fontSize: 20, color: 'white', padding: 1, mr: 1 }} />
              <Typography variant="h6" sx={{ fontSize: 20 }}>
                Content Scheduling
              </Typography>
            </Box>
            <MiniCalendar selectedDay={selectedDay} onDateChange={setSelectedDay} />
          </Box>
          <Sidebar />
        </div>
        <main className="main-content">
          <h1 className="welcome-header">Welcome to R Systems</h1>
          <PreviewUI />
          <TimeLine selectedDay={selectedDay} onDateChange={setSelectedDay} />
        </main>
      </div>
    </DndProvider>
  );
};

export default ContentScheduler;
