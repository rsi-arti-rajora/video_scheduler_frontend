import React, { useState, useEffect } from 'react';
import moment from 'moment';
import { toast } from 'react-toastify';
import { useDrag, useDrop } from 'react-dnd';
import './AutomateModal.css';


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
      className="draggable-video-item"
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <span style={{ flex: 1 }}>{video.file_name}</span>
      <button
        onClick={() => removeVideo(index)}
        className="draggable-video-item-button"
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
    <div className="multi-select-container">
      {/* Selection Box with Dropdown Arrow */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="multi-select-box"
      >
        <span>
          {selectedOptions.length > 0 
            ? `${selectedOptions.length} files selected`
            : 'Select files'}
        </span>
        {/* Dropdown Arrow */}
        <span className="modal-multiselect-arrow">
          {isOpen ? '▲' : '▼'}
        </span>
      </div>
      
      {/* Dropdown Options */}
      {isOpen && (
        <div className="multi-select-dropdown">
          {/* Select All Option */}
          <div
            onClick={handleSelectAll}
            className="multi-select-all"
          >
            {areAllSelected ? '✓ Deselect All' : 'Select All'}
          </div>
          
          {/* Individual Options */}
          {options.map(option => (
            <div
              key={option.id}
              onClick={() => handleOptionClick(option)}
              className="multi-select-option"
              style={{
                backgroundColor: selectedOptions.some(selected => selected.id === option.id)
                  ? '#e6f3ff'
                  : 'white'
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
    <div className="modal-overlay" >
      <div className="modal-content" >
        <h2 className="modal-overview-h2" >
          Automate Events For Date "{moment(selectedDate).format('DD-MMM-YY')}"
        </h2>
  
        <MultiSelect
          options={s3_videos}
          selectedOptions={fileList}
          onChange={handleSelectedVideos}
        />
  
        {/* File List - Increased Height */}
        <div className="file-list" >
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
        <div className = "time-selection-container" >
          <div className = "time-input-group" >
            <label className = "time-label" >Start Time:</label>
            <input
              type="time"
              value={automationStartTime}
              onChange={(e) => setAutomationStartTime(e.target.value)}
              className="time-input"
            />
          </div>
          <div className = "time-input-group" >
            <label className = "time-label" >End Time:</label>
            <input
              type="time"
              value={automationEndTime}
              onChange={(e) => setAutomationEndTime(e.target.value)}
              className="time-input"
            />
          </div>
        </div>
  
        {/* Buttons Section - Reduced Bottom Space */}
        <div className = "modal-buttons" >
          <button
            onClick={onClose}
            className="modal-cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleAutomationSetup}
            className="modal-set-button"
          >
            Set
          </button>
        </div>
      </div>
    </div>
  );
};

export default AutomateModal;