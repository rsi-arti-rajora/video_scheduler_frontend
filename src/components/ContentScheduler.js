import React from 'react';
import Sidebar from './Sidebar';
import TimeLine from './timeline';
import PreviewUI from './upload-preview';
import { DndProvider } from 'react-dnd'; // Import DndProvider
import { HTML5Backend } from 'react-dnd-html5-backend'; // Import HTML5Backend

const ContentScheduler = () => {
  return (
    <DndProvider backend={HTML5Backend}> {/* Wrap everything in one DndProvider */}
      <div className="scheduler-container">
        <Sidebar />
        <main className="main-content">
          <h1 className="welcome-header">Welcome to R Systems</h1>
          <PreviewUI />
          <TimeLine />
        </main>
      </div>
    </DndProvider>
  );
};

export default ContentScheduler;
