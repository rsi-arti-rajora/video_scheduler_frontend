// components/ContentScheduler.js
import React from 'react';
import Sidebar from './Sidebar';
import TimeLine from './timeline';
import PreviewUI from './upload-preview';

const ContentScheduler = () => {
  return (
    <div className="scheduler-container">
      <Sidebar />

      <main className="main-content">
        <h1 className="welcome-header">Welcome to R Systems</h1>
        <PreviewUI />
        <TimeLine />
      </main>
    </div>
  );
};

export default ContentScheduler;