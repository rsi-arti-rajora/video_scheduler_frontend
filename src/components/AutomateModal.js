import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useDrag, useDrop } from 'react-dnd';

// Helper Functions remain the same
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const generateUniqueNumericId = () => {
  return Math.floor(Math.random() * (10**18 - 10**17) + 10**17);
};

// DraggableVideoItem component remains the same
const DraggableVideoItem = ({ video, index, moveVideo, removeVideo }) => {
  const [{ isDragging }, drag] = useDrag({
    type: 'VIDEO',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [, drop] = useDrop({
    accept: 'VIDEO',
    hover: (draggedItem) => {
      if (draggedItem.index !== index) {
        moveVideo(draggedItem.index, index);
        draggedItem.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => drag(drop(node))}
      style={{
        opacity: isDragging ? 0.5 : 1,
        display: 'flex',
        alignItems: 'center',
        padding: '10px',
        border: '1px solid #ddd',
        marginBottom: '5px',
        cursor: 'move',
        backgroundColor: 'white'
      }}
    >
      <span style={{ flex: 1 }}>{video.file_name}</span>
      <button
        onClick={() => removeVideo(index)}
        style={{
          backgroundColor: 'white',
          color: 'red',
          border: 'none',
          padding: '5px 10px',
          borderRadius: '3px'
        }}
      >
        x
      </button>
    </div>
  );
};

const MultiSelect = ({ options, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelectAll = () => {
    if (selectedOptions.length === options.length) {
      onChange([]); // Deselect all
    } else {
      onChange([...options]); // Select all
    }
  };

  const handleOptionClick = (option) => {
    const isSelected = selectedOptions.some(selected => selected.id === option.id);
    if (isSelected) {
      onChange(selectedOptions.filter(selected => selected.id !== option.id));
    } else {
      onChange([...selectedOptions, option]);
    }
  };

  const areAllSelected = selectedOptions.length === options.length;

  return (
    <div style={{ position: 'relative', width: '100%', marginBottom: '20px' }}>
      {/* Selection Box with Dropdown Arrow */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          border: '1px solid #ddd',
          padding: '10px',
          cursor: 'pointer',
          backgroundColor: 'white',
          borderRadius: '4px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}
      >
        <span>
          {selectedOptions.length > 0 
            ? `${selectedOptions.length} files selected`
            : 'Select files'}
        </span>
        {/* Dropdown Arrow */}
        <span style={{ fontSize: '14px', marginLeft: '10px' }}>
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {/* Dropdown Options */}
      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          backgroundColor: 'white',
          border: '1px solid #ddd',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          zIndex: 1000
        }}>
          {/* Select All Option */}
          <div
            onClick={handleSelectAll}
            style={{
              padding: '10px',
              cursor: 'pointer',
              backgroundColor: '#f5f5f5',
              borderBottom: '2px solid #ddd',
              fontWeight: 'bold'
            }}
          >
            {areAllSelected ? '✓ Deselect All' : 'Select All'}
          </div>
          
          {/* Individual Options */}
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option)}
              style={{
                padding: '10px',
                cursor: 'pointer',
                backgroundColor: selectedOptions.some(selected => selected.id === option.id)
                  ? '#e6f3ff'
                  : 'white',
                ':hover': {
                  backgroundColor: '#f5f5f5'
                }
              }}
            >
              {option.file_name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Main AutomateModal Component remains the same
const AutomateModal = ({ selectedDate, s3_videos = [], onClose, onAutomate }) => {
  const [fileList, setFileList] = useState([]);
  const [automationStartTime, setAutomationStartTime] = useState('');
  const [automationEndTime, setAutomationEndTime] = useState('');

  const handleSelectedVideos = (selectedVideos) => {
    setFileList(selectedVideos);
  };

  const moveVideo = (fromIndex, toIndex) => {
    const updatedList = [...fileList];
    const [removed] = updatedList.splice(fromIndex, 1);
    updatedList.splice(toIndex, 0, removed);
    setFileList(updatedList);
  };

  const removeVideo = (index) => {
    const updatedList = fileList.filter((_, i) => i !== index);
    setFileList(updatedList);
  };

  const scheduleEvents = (data, startDateTime, endDateTime) => {
    const totalDuration = data.reduce((sum, event) => sum + event.duration, 0);
    const timeRangeInSeconds = (endDateTime - startDateTime) / 1000;
    
    if (timeRangeInSeconds < totalDuration) {
      throw new Error("The provided time range is too short for all events.");
    }

    let currentTime = startDateTime;
    const scheduledEvents = [];

    while (currentTime < endDateTime) {
      for (const event of data) {
        const eventStartTime = new Date(currentTime.getTime() + 1000);
        const eventEndTime = new Date(eventStartTime.getTime() + (event.duration * 1000));

        if (eventEndTime > endDateTime) {
          currentTime = endDateTime;
          break;
        }
        
        const baseUrl = "https://pocrsibucket.s3.amazonaws.com/";
        const filePath = event.file_url.replace(baseUrl, '');

        scheduledEvents.push({
          id: `${generateUniqueNumericId()}-${Date.now()}`,
          title: `${event.file_name} (${moment(eventStartTime).format('HH:mm:ss')} - ${moment(eventEndTime).format('HH:mm:ss')})`,
          start: eventStartTime,
          end: eventEndTime,
          originalTitle: event.file_name,
          duration: event.duration,
          key: filePath,
          color: generateRandomColor()
        });

        currentTime = eventEndTime;
      }

      if (currentTime >= endDateTime) {
        break;
      }
    }

    return scheduledEvents;
  };

  const handleAutomationSetup = () => {
    if (!automationStartTime || !automationEndTime) {
      toast.error('Please set both start and end times');
      return;
    }

    if (fileList.length === 0) {
      toast.error('Please select at least one video');
      return;
    }

    const selectedDateObj = new Date(selectedDate);
    const [startHours, startMinutes] = automationStartTime.split(':');
    const [endHours, endMinutes] = automationEndTime.split(':');

    const startDateTime = new Date(selectedDateObj);
    startDateTime.setHours(parseInt(startHours), parseInt(startMinutes), 0);

    const endDateTime = new Date(selectedDateObj);
    endDateTime.setHours(parseInt(endHours), parseInt(endMinutes), 0);

    if (startDateTime >= endDateTime) {
      toast.error('End time must be after start time');
      return;
    }

    if (startDateTime <= new Date()) {
      toast.error('Start time must be in the future');
      return;
    }

    try {
      const events = scheduleEvents(fileList, startDateTime, endDateTime);
      onAutomate(events);
      onClose();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <div className="modal-content" style={{
        backgroundColor: 'white',
        padding: '20px',
        borderRadius: '12px',
        width: '80%',
        maxWidth: '500px',
        height: '75vh', // Adjusted to better fit contents
        minHeight: '420px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden'
      }}>
        <h2 style={{ 
          margin: '0 0 15px 0',
          fontSize: '22px',
          fontWeight: '600'
        }}>
          Automate Events For Date "{moment(selectedDate).format('DD-MMM-YY')}"
        </h2>
  
        <MultiSelect
          options={s3_videos}
          selectedOptions={fileList}
          onChange={handleSelectedVideos}
        />
  
        {/* File List - Increased Height */}
        <div className="file-list" style={{ 
          flex: 2, // Increased height to show at least 4 items
          overflowY: 'auto',
          marginTop: '10px',
          padding: '8px',
          border: '1px solid #eee',
          borderRadius: '8px',
          backgroundColor: 'white'
        }}>
          {fileList.map((video, index) => (
            <DraggableVideoItem
              key={video.id}
              video={video}
              index={index}
              moveVideo={moveVideo}
              removeVideo={removeVideo}
            />
          ))}
        </div>
  
        {/* Start & End Time Section - Reduced Gap */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '15px',
          marginTop: '10px', // Reduced gap
          padding: '10px',
          backgroundColor: 'white',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px', fontWeight: '500' }}>Start Time:</label>
            <input
              type="time"
              value={automationStartTime}
              onChange={(e) => setAutomationStartTime(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '6px',
                width: '110px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <label style={{ width: '80px', fontWeight: '500' }}>End Time:</label>
            <input
              type="time"
              value={automationEndTime}
              onChange={(e) => setAutomationEndTime(e.target.value)}
              style={{
                marginLeft: '8px',
                padding: '6px',
                width: '110px',
                borderRadius: '4px',
                border: '1px solid #ddd'
              }}
            />
          </div>
        </div>
  
        {/* Buttons Section - Reduced Bottom Space */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'flex-end', 
          gap: '10px',
          padding: '15px 10px 0 10px',
          borderTop: '1px solid #eee',
          marginTop: 'auto' // Pushes buttons to bottom
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#f44336',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAutomationSetup}
            style={{
              padding: '8px 20px',
              backgroundColor: '#4CAF50',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomateModal;