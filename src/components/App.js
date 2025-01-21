import React from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import ContentScheduler from './components/ContentScheduler';
import './components/content-scheduler-styles.css';

function App() {
  return (
    <div className="app-container">
      <DndProvider backend={HTML5Backend}>
        <ContentScheduler />
      </DndProvider>
    </div>
  );
}

export default App;
