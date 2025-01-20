import React from 'react';
import ContentScheduler from './components/ContentScheduler';
import './components/content-scheduler-styles.css';

import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

function App() {
  return ( // Corrected the missing return here
    <DndProvider backend={HTML5Backend}>  {/* DndProvider should wrap the entire return JSX */}
      <div className="app-container">
        <ContentScheduler />
      </div>
    </DndProvider>
  );
}

export default App;
