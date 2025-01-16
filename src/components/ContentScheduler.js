import React, { useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight, PlayCircle, Search } from 'lucide-react';
import './content-scheduler-styles.css';
import Sidebar from './Sidebar';
import TimeLine from './timeline';
import PreviewUI from './upload-preview';

const ContentScheduler = () => {
  const days = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isVideoUploaded, setIsVideoUploaded] = useState(false);
  const [uploadedVideo, setUploadedVideo] = useState(''); // Store uploaded video URL
  const [showSuccessMessage, setShowSuccessMessage] = useState(false); // State for success message visibility

  const togglePopup = () => {
    setIsPopupVisible(!isPopupVisible);
    setIsVideoUploaded(false); // Reset message when popup is toggled
  };

  const handleUpload = (event) => {
    const file = event.target.files ? event.target.files[0] : null; // Ensure files array exists

    if (file) {
      const videoURL = URL.createObjectURL(file); // Create a temporary URL for the uploaded video
      setUploadedVideo(videoURL);
      setIsVideoUploaded(true); // Mark upload as successful
      setIsPopupVisible(false); // Close popup
      alert('Video uploaded successfully!');
    } else {
      // Handle case when no file is selected or file is invalid
      alert('No file selected. Please choose a valid video file.');
    }
  };

  const getDaysInMonth = (month, year) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const renderMiniCalendar = () => {
    const daysInMonth = getDaysInMonth(currentMonth, currentYear);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

    return (
      <div className="mini-calendar">
        <div className="mini-calendar-grid">
          {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
            <div key={day} className="mini-calendar-day">{day}</div>
          ))}
          {days.map(day => (
            <div key={day} className={`mini-calendar-day ${day === 14 ? 'active' : ''}`}>
              {day}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const handleCancel = () => {
    setIsPopupVisible(false); // Close the popup
    setShowSuccessMessage(true); // Show the success message
    setTimeout(() => {
      setShowSuccessMessage(false); // Hide the success message after 30 seconds
    }, 3000); // 3000ms = 3 seconds, adjust this if you want it for 30 seconds
  };

  return (
    <div className="scheduler-container">
      <Sidebar uploadedVideo={uploadedVideo} />

      <main className="main-content">
        <h1 className="welcome-header">Welcome to R Systems</h1>

        {/* <div className="preview-grid">
          <div className="preview-card">
            <h2 className="preview-title">Output Preview</h2>
            <div className="preview-content">
              <img src="/api/placeholder/400/225" alt="Preview" className="w-full h-full object-cover rounded-lg opacity-80" />
              <PlayCircle className="play-button" />
            </div>
          </div>
        </div> */}

        <PreviewUI />

        <TimeLine />
      </main>

      {/* Publish Button */}
      <button className="publish-button" onClick={togglePopup}>
        Publish
      </button>

      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-message">
          <p>Video upload process cancelled successfully!</p>
        </div>
      )}

      {/* Popup */}
      {isPopupVisible && (
        <div className="popup-overlay">
          <div className="popup">
            <h2>Upload Video</h2>
            <input 
              type="file" 
              accept="video/mp4" 
              onChange={handleUpload} 
            />
            <div className="popup-actions">
              <button onClick={handleCancel} className="cancel-button">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentScheduler;
