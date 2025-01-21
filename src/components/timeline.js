import React, { useState,useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from 'moment';
import './timeline.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import apiService from '../services/apiService';
import { toast,ToastContainer } from 'react-toastify'; // Import toast
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast


const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);


const TimeLine = () => {
  const [events, setEvents] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [duration, setDuration] = useState(null);
  const [popupStartTime, setPopupStartTime] = useState(new Date());
  const [recurrence, setRecurrence] = useState('never');
  const [occurrences, setOccurrences] = useState(1); // User-entered occurrences
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSaveVisible, setSaveVisible] = useState(false);


   // Fetch events from backend
   useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Fetch the events from the backend
        const fetchedEvents = await apiService.fetchScheduledEvents();

        // Flatten the events from each date and map them to the required format
        const transformedEvents = fetchedEvents.flatMap((day) =>
          day.events.map((event) => {
            // Convert start_time and end_time from strings to Date objects
            const startTime = new Date(event.start_time); 
            const endTime = new Date(event.end_time);
            const fileName =  event.file_name.split('/').pop();// Remove file extension from file name

            return {
              id: event.file_name, // Use file_name as event ID
              title: fileName, // You can use file_name as the title as well
              start: startTime,
              end: endTime,
              duration: (endTime - startTime) / 1000 / 60, // Calculate duration in minutes
              key: event.file_name, // Assuming the key is the file name, adjust if needed
              color: '#10b981', // Example color, can be adjusted
            };
          })
        );
        console.log("transformedEvents",transformedEvents);
        setEvents(transformedEvents); // Set the transformed events in the state
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      }
    };

    fetchEvents(); // Call the fetchEvents function when the component mounts
  }, []);

  // Handling drop event
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'video',
    drop: (item, monitor) => {
      const calendarElement = document.querySelector(".rbc-time-content");
      const calendarHeaderElement = document.querySelector(".rbc-day-bg");
      if (!calendarElement || !calendarHeaderElement) return;

      const bounds = calendarElement.getBoundingClientRect();
      const { x, y } = monitor.getClientOffset();
      const scrollTop = calendarElement.scrollTop;

      //For Timing
      // Calculate the relative position considering scroll
      const relativeY = y - bounds.top + scrollTop;      
      // Get the total height of the time slots
      const totalHeight = calendarElement.scrollHeight;    
      // Calculate the percentage through the day (24 hours)
      const percentageOfDay = relativeY / totalHeight;     
      // Convert to minutes since midnight
      const minutesSinceMidnight = percentageOfDay * 24 * 60;      
      // Calculate hours and minutes
      const hours = Math.floor(minutesSinceMidnight / 60);
      const minutes = Math.round(minutesSinceMidnight % 60);


      //For Date
      // Get the date from the calendar cell where the item was dropped
      const dayHeaders = document.querySelectorAll(".rbc-header");
      const dayWidth = calendarHeaderElement.offsetWidth;
      const startX = dayHeaders[0].getBoundingClientRect().left;
      const relativeX = x - startX;
      const dayIndex = Math.floor(relativeX / dayWidth);
      const spanValue = dayHeaders[dayIndex].querySelector('span')?.textContent.trim();

      // Extract the day (number) from the spanValue
      const day = parseInt(spanValue.split(" ")[0], 10);
      
      const currentDate = new Date();

      // Create a new date with the extracted day
      const weekStartDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      // Calculate the dropped date by adding days to the week's start
      const dropDate = new Date(weekStartDate);

      // Set the correct day
      dropDate.setDate(weekStartDate.getDate());
      
      // Set the correct hours and minutes
      dropDate.setHours(hours, minutes, 0, 0);
 
      // Set the time and show popup
      setPopupStartTime(dropDate);
      setSelectedVideo(item); // Store the video item
      setShowPopup(true); // Show the popup
      setSaveVisible(true); // Show save button
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handlePopupSubmit = () => {
    const { id, title, duration,key } = selectedVideo;
    const startTime = popupStartTime;
    const durationInMs = duration * 60 * 1000;

    let newEvents = [];

    // Create events based on recurrence pattern and occurrences entered by user
    for (let i = 0; i < occurrences; i++) {
      let currentStartTime = new Date(startTime.getTime() + i * getRecurrenceInterval());
      let currentEndTime = new Date(currentStartTime.getTime() + durationInMs);

      newEvents.push({
        id: `${id}-${i}`,
        title,
        start: currentStartTime,
        end: currentEndTime,
        duration: duration,
        key,
        color: '#10b981',
      });
    }

    setEvents((prevEvents) => [...prevEvents, ...newEvents]);
    setShowPopup(false);
  };

  const getRecurrenceInterval = () => {
    switch (recurrence) {
      case 'hourly':
        return 60 * 60 * 1000;
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      case 'never':
        return 0; // No recurrence
      default:
        return 24 * 60 * 60 * 1000;
    }
  };

  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: '#fff',
        borderRadius: '5px',
        padding: '5px',
        border: 'none',
        fontSize: '12px',
        textAlign: 'center',
      },
    };
  };

  const handleSlotSelect = (slotInfo) => {
    setPopupStartTime(slotInfo.start);
    setShowPopup(true);
  };

  const handleRecurrenceChange = (e) => {
    setRecurrence(e.target.value);
    if (e.target.value === 'never') {
      setOccurrences(1); // Automatically set occurrences to 1 for 'never'
    }
  };

  const handleOccurrencesChange = (e) => {
    if (recurrence !== 'never') {
      setOccurrences(parseInt(e.target.value, 10) || 1);
    }
  };

  const handleDateTimeChange = (e) => {
    setPopupStartTime(new Date(e.target.value));
  };

  const handleEventClick = (event) => {
    setEditingEvent(event);
    setPopupStartTime(event.start);
    setRecurrence('never'); // Default recurrence, can be set based on event data
    setShowPopup(true);
  };

  const handleSaveEvent = async () => {
    // Prepare event data, assuming events is an array
    const eventData = events.map(event => ({
      file_name: event.key, // Assuming event title is the file name
      start_time: moment(event.start).format('YYYY-MM-DDTHH:mm:ss.SSS'), // Convert to ISO format string
      duration: event.duration, // Assuming each event has a duration property
    }));
  
    console.log('Events to be scheduled:', eventData);
  
    try {
      // Send the eventData to the backend via the scheduleVideo function
      const response = await apiService.scheduleVideo(eventData);
      toast.success('Events saved successfully!'); // Show success toast message
    } catch (error) {
      console.error('Error scheduling video:', error);
      toast.error('Failed to save events. Please try again.'); // Show error toast message
    }
  };
  



  const handleEditEventSubmit = () => {
    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? { ...event, start: popupStartTime,recurrence: recurrence, occurrences: occurrences }
        : event
    );
    setEvents(updatedEvents);
    setShowPopup(false);
    setEditingEvent(null);
    setSaveVisible(true);
  };

  return (
    <div className="calendar-container" ref={drop}>
     
      {/* Popup for adding/editing events */}
      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-content">
            <button className="close-popup" onClick={() => setShowPopup(false)}>
              ✕
            </button>
            <h3>{editingEvent ? 'Edit Event' : 'Select Time Slot'}</h3>
            <div>
              <label>Select Start Date & Time:</label>
              <input
                type="datetime-local"
                value={moment(popupStartTime).format('YYYY-MM-DDTHH:mm')}
                onChange={handleDateTimeChange}
              />
            </div>
            <div>
              <label>Recurrence:</label>
              <select value={recurrence} onChange={handleRecurrenceChange}>
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="never">Never</option>
              </select>
            </div>
            {recurrence !== 'never' && (
              <div>
                <label>Occurrences:</label>
                <input
                  type="number"
                  min="1"
                  value={occurrences}
                  onChange={handleOccurrencesChange}
                  style={{ width: '50px' }}
                />
              </div>
            )}
            <div className="popup-buttons">
              {editingEvent ? (
                <button onClick={handleEditEventSubmit}>Update Event</button>
              ) : (
                <button onClick={handlePopupSubmit}>Submit</button>
              )}
            </div>
          </div>
        </div>
      )}
<div className="calendar-wrapper">
  {/* Save Event Button (only when events are created) */}
  {isSaveVisible && (
    <button className="save-event-btn" onClick={handleSaveEvent}>
      Save Events
    </button>
  )}

  {/* Calendar component */}
  <DnDCalendar
    localizer={localizer}
    events={events}
    defaultView="week"
    style={{
      height: '600px',
      margin: '20px auto',
      backgroundColor: '#fff',
      border: '1px solid #ddd',
      borderRadius: '10px',
      padding: '10px',
    }}
    eventPropGetter={eventStyleGetter}
    onSelectSlot={handleSlotSelect}
    onDoubleClickEvent={handleEventClick} 
    draggable
    onEventDrop={({ event, start, end }) => {
      setSaveVisible(true);
      const updatedEvents = events.map((e) =>
        e.id === event.id ? { ...e, start, end } : e
      );
      setEvents(updatedEvents);
    }}
    onEventResize={({ event, start, end }) => {
      setSaveVisible(true);
      const updatedEvents = events.map((e) =>
        e.id === event.id ? { ...e, start, end } : e
      );
      setEvents(updatedEvents);
    }}
  />
</div>
<ToastContainer />
    </div>
  );
};

export default TimeLine;