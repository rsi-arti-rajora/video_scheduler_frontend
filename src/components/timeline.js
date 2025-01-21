import React, { useState, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from 'moment';
import './timeline.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import apiService from '../services/apiService';
import { toast, ToastContainer } from 'react-toastify'; // Import toast
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
  const [occurrences, setOccurrences] = useState(1);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isSaveVisible, setSaveVisible] = useState(false);
  const [repeatAfterEnd, setRepeatAfterEnd] = useState(false); // New state for repeat after end

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await apiService.fetchScheduledEvents();
        const transformedEvents = fetchedEvents.flatMap((day) =>
          day.events.map((event) => {
            const startTime = new Date(event.start_time);
            const endTime = new Date(event.end_time);
            const fileName = event.file_name.split('/').pop();
            return {
              id: event.file_name,
              title: fileName,
              start: startTime,
              end: endTime,
              duration: (endTime - startTime) / 1000 / 60,
              key: event.file_name,
              color: '#10b981',
            };
          })
        );
        setEvents(transformedEvents);
      } catch (error) {
        console.error('Error fetching events:', error);
        toast.error('Failed to fetch events');
      }
    };

    fetchEvents();
  }, []);

  // Handling drop event
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'video',
    drop: (item, monitor) => {
      setSelectedVideo(item);
      setDuration(item.duration);
      setPopupStartTime(new Date());
      setShowPopup(true);
      setSaveVisible(true);
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handlePopupSubmit = () => {
    const { id, title, duration, key } = selectedVideo;
    const startTime = popupStartTime;
    const durationInMs = duration * 60 * 1000;

    let newEvents = [];
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
      case 'minutely':
        return 60 * 1000;
      case 'hourly':
        return 60 * 60 * 1000;
      case 'daily':
        return 24 * 60 * 60 * 1000;
      case 'weekly':
        return 7 * 24 * 60 * 60 * 1000;
      case 'monthly':
        return 30 * 24 * 60 * 60 * 1000;
      case 'never':
        return 0;
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
      setOccurrences(1);
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
    setRecurrence('never');
    setShowPopup(true);
  };

  const handleSaveEvent = async () => {
    const eventData = events.map(event => ({
      file_name: event.key,
      start_time: moment(event.start).format('YYYY-MM-DDTHH:mm:ss.SSS'),
      duration: event.duration,
    }));

    try {
      const response = await apiService.scheduleVideo(eventData);
      toast.success('Events saved successfully!');
      setSaveVisible(false);
    } catch (error) {
      toast.error('Failed to save events. Please try again.');
    }
  };

  const handleDeleteEvent = (eventId) => {
    setEvents((prevEvents) => prevEvents.filter((event) => event.id !== eventId));
    setSaveVisible(true);
  };

  const handleRepeatAfterEndChange = () => {
    setRepeatAfterEnd(!repeatAfterEnd);
  };

  const handleEditEventSubmit = () => {
    const updatedEvents = events.map((event) =>
      event.id === editingEvent.id
        ? { ...event, start: popupStartTime, recurrence, occurrences }
        : event
    );
    setEvents(updatedEvents);
    setShowPopup(false);
    setEditingEvent(null);
  };

  const handleRestartStream = () => { 
    // Call the API to restart the stream
    apiService.restartStream()
      .then(() => {
        toast.success('Stream restarted successfully');
      })
      .catch(() => {
        toast.error('Failed to restart stream');
      });
  }

  return (
    <div className="calendar-container" ref={drop}>
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
                <option value="minutely">Minutely</option>
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
            <div>
              <label>Repeat After End:</label>
              <input
                type="checkbox"
                checked={repeatAfterEnd}
                onChange={handleRepeatAfterEndChange}
              />
            </div>
            <div className="popup-buttons">
              {editingEvent ? (
                <>
                  <button onClick={handleEditEventSubmit}>Update Event</button>
                  <button onClick={() => handleDeleteEvent(editingEvent.id)}>Delete Event</button>
                </>
              ) : (
                <button onClick={handlePopupSubmit}>Submit</button>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="calendar-wrapper">
        
        
        <button className="save-event-btn" onClick={handleRestartStream}>Restart Stream</button>
        
        {isSaveVisible && (
          <button className="save-event-btn" onClick={handleSaveEvent}>
            Save Events
          </button>
        )}

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
