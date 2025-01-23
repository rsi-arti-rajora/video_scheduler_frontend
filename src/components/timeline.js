import {React, useState, useEffect, useMemo, useCallback } from 'react';

import { useDrop } from 'react-dnd';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from 'moment';
import './timeline.css';
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "react-big-calendar/lib/css/react-big-calendar.css";
import apiService from '../services/apiService';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const localizer = momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const TimeLine = ({ selectedDay, onDateChange }) => {
  const [events, setEvents] = useState([]);
  const [isSaveVisible, setSaveVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Track the current time for the current time line
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newEventTime, setNewEventTime] = useState('');
  // Memoized timeline date to avoid unnecessary re-renders
  const timelineDate = useMemo(() => (selectedDay instanceof Date ? selectedDay : new Date()), [selectedDay]);

  // Fetch events from backend
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const fetchedEvents = await apiService.fetchScheduledEvents();
        const transformedEvents = fetchedEvents.flatMap((day) =>
          day.events.map((event) => {
            const startTime = new Date(event.start_time);
            const endTime = new Date(event.end_time);
            const fileName = event?.file_name?.split('/').pop(); // Remove file extension from file name

            return {
              id: event.id + fileName,
              title: `${fileName} (${moment(startTime).format('HH:mm:ss')} - ${moment(endTime).format('HH:mm:ss')})`,
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

  // Update the current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date()); // Update current time every minute
    }, 1000); // 60000 ms = 1 minute

    return () => clearInterval(interval); // Clear interval on cleanup
  }, []);

  
  // Handle drag and drop
  const [{ canDrop, isOver }, drop] = useDrop({
    accept: 'video',
    drop: useCallback((item, monitor) => {
      const calendarElement = document?.querySelector(".rbc-time-content");
      if (!calendarElement) return;

      const bounds = calendarElement.getBoundingClientRect();
      const { x, y } = monitor.getClientOffset();
      const scrollTop = calendarElement.scrollTop;

      const relativeY = y - bounds.top + scrollTop;
      const totalHeight = calendarElement.scrollHeight;
      const percentageOfDay = relativeY / totalHeight;
      const minutesSinceMidnight = percentageOfDay * 24 * 60;
      const hours = Math.floor(minutesSinceMidnight / 60);
      const minutes = Math.round(minutesSinceMidnight % 60);
      const seconds = 0;

      // Get the current date from the calendar's date header
      const dateHeader = document.querySelector('.rbc-toolbar-label');
      let currentDate = dateHeader ? new Date(dateHeader.textContent) : new Date();

      // Ensure the date is valid
      if (isNaN(currentDate.getTime())) {
        console.error('Invalid date in calendar header:', dateHeader.textContent);
        currentDate = new Date();
      }  else {
        // Set the year to the current year if the parsed year is not the current year
        if (currentDate.getFullYear() !== new Date().getFullYear()) {
          currentDate.setFullYear(new Date().getFullYear());
        }
      }

      let dropDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate(),
        hours,
        minutes,
        seconds
      );
																													  
      const durationInMs = Math.round(item.duration) * 1000;

      // Constants for time calculations
      const FIVE_MINUTES = 5 * 60 * 1000; // 5 minutes in milliseconds
      const ONE_SECOND = 1 * 1000; // 1 second in milliseconds

      // Check for nearby scheduled events (within 30 minutes)
      const nearbyEvent = events
        .sort((a, b) => a.end - b.end)
        .find(event => {
          const timeDifference = Math.abs(event.end.getTime() - dropDate.getTime());
          return timeDifference <= FIVE_MINUTES;
        });

      // If there's a nearby event, adjust the drop time
      if (nearbyEvent) {
        dropDate = new Date(nearbyEvent.end.getTime() + ONE_SECOND);
      }
      let dropEndTime = new Date(dropDate.getTime() + durationInMs);

      // Prevent overlapping events
      const hasOverlap = events.some(
        (event) =>
          (dropDate >= event.start && dropDate < event.end) ||
          (dropEndTime > event.start && dropEndTime <= event.end)
      );

      // If overlap, find the next available time slot
      if (hasOverlap) {
        const sortedEvents = [...events].sort((a, b) => a.start - b.start); // Sort by start time
        let nextAvailableTime = dropDate.getTime();

        // Check if event is near another event (within 1 hour)
        const hourInMs = 60 * 60 * 1000;
        const conflictingEvent = sortedEvents.find(event => {
          return (
            dropDate.getTime() <= event.end.getTime() + hourInMs &&
            dropDate.getTime() >= event.end.getTime() - hourInMs
          );
        });

        // If conflicting event found, place the event after it
        if (conflictingEvent) {
          nextAvailableTime = conflictingEvent.end.getTime();
          dropDate.setTime(nextAvailableTime);
        }

        // Ensure no overlap by checking the sorted events
        dropEndTime = new Date(dropDate.getTime() + durationInMs);
      }

      // If the drop is near the current time, snap to the next available slot
      const currentTime = new Date();
      if (dropDate.getTime() < currentTime.getTime()) {
        dropDate.setTime(currentTime.getTime());
        dropEndTime = new Date(dropDate.getTime() + durationInMs);
      }

      setEvents((prevEvents) => [
        ...prevEvents,
        {
          id: `${item.id}-${Date.now()}`,
          title: `${item.title} (${moment(dropDate).format('HH:mm:ss')} - ${moment(dropEndTime).format('HH:mm:ss')})`,
          start: dropDate,
          end: dropEndTime,
          originalTitle: item.title,
          duration: item.duration,
          key: item.key,
          color: '#10b981',
        },
      ]);
      setSaveVisible(true);
    }, [events]),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      color: '#fff',
      borderRadius: '5px',
      padding: '5px',
      border: 'none',
      fontSize: '12px',
      textAlign: 'center',
      ...(event.start.getTime() === currentTime.getTime() && { backgroundColor: 'yellow' }), // Highlight current time with yellow color
    },
  });

  const handleEventDoubleClick = (event) => {
    setSelectedEvent(event);
    setNewEventTime(moment(event.start).format('YYYY-MM-DDTHH:mm'));
    setIsModalOpen(true);
  };

  const handleDeleteEvent = () => {
    setEvents(events.filter(event => event.id !== selectedEvent.id));
    setIsModalOpen(false);
    setSaveVisible(true);
    toast.success('Event deleted successfully!');
  };

  const handleRescheduleEvent = () => {
    const newDateTime = new Date(newEventTime);
    const durationInMs = selectedEvent.duration * 1000;
    console.log("vikas in handle reschedule event newDateTime: ",newDateTime);
    console.log("vikas in handle reschedule event  selectedEvent.duration: ", durationInMs);
    const newEndTime = new Date(newDateTime.getTime() + durationInMs);

    const hasOverlap = events.some(
      event =>
        event.id !== selectedEvent.id &&
        ((newDateTime >= event.start && newDateTime < event.end) ||
         (newEndTime > event.start && newEndTime <= event.end))
    );

    if (hasOverlap) {
      toast.error('This time slot overlaps with another event');
      return;
    }

    const updatedEvents = events.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          start: newDateTime,
          end: newEndTime,
          title: `${event.originalTitle} (${moment(newDateTime).format('HH:mm:ss')} - ${moment(newEndTime).format('HH:mm:ss')})`
        };
      }
      return event;
    });

    setEvents(updatedEvents);
    setIsModalOpen(false);
    setSaveVisible(true);
    toast.success('Event rescheduled successfully!');
  };

  const handleSaveEvent = async () => {
    const eventData = events.map((event) => ({
      file_name: event.key,
      start_time: moment(event.start).format('YYYY-MM-DDTHH:mm:ss.SSS'),
      duration: event.duration,
    }));

    try {
      await apiService.scheduleVideo(eventData);
      toast.success('Events saved successfully!');
      setSaveVisible(false);
    } catch (error) {
      toast.error('Failed to save events. Please try again.');
    }
  };

  return (
    <div className="calendar-container" ref={drop}>
      {isSaveVisible && (
        <button className="save-event-btn" onClick={handleSaveEvent}>
          Save Events
        </button>
      )}

      <DnDCalendar
        localizer={localizer}
        events={events}
        defaultView="day"
        views={['day']}
        step={10}
        timeslots={1}
        scrollToTime={timelineDate}
        date={timelineDate}
        onNavigate={onDateChange}
        resizable // Disable resizing
        draggableAccessor={() => true} // Enable dragging
        style={{
          height: '600px',
          margin: '20px auto',
          backgroundColor: '#fff',
          border: '1px solid #ddd',
          borderRadius: '10px',
          padding: '10px',
        }}
        eventPropGetter={eventStyleGetter}
        onEventDrop={({ event, start, end }) => {
          const durationInMs = event.duration * 1000;
          const dropEndTime = new Date(start.getTime() + durationInMs);

          // Prevent overlapping during drag
          const hasOverlap = events.some(
            (e) =>
              e.id !== event.id &&
              ((start >= e.start && start < e.end) || (dropEndTime > e.start && dropEndTime <= e.end))
          );

          if (hasOverlap) {
            return;
          }

          setSaveVisible(true);
          const updatedEvents = events.map((e) =>
            e.id === event.id ? { ...e, start, end: dropEndTime, title: `${event.originalTitle} (${moment(start).format('HH:mm:ss')} - ${moment(dropEndTime).format('HH:mm:ss')})` } : e
          );
          setEvents(updatedEvents);
        }}
		    onDoubleClickEvent={handleEventDoubleClick}		
      />
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Event Management</h2>
						 
						 
            <div className="modal-body">
              <div className="form-group">
                <label>Event:</label>
                <div className="event-title">{selectedEvent?.originalTitle}</div>
              </div>
              
              <div className="form-group">
                <label>Reschedule to:</label>
                <input
                  type="datetime-local"
                  value={newEventTime}
                  onChange={(e) => setNewEventTime(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="delete-btn" onClick={handleDeleteEvent}>
                Delete Event
              </button>
              <button className="cancel-btn" onClick={() => setIsModalOpen(false)}>
                Cancel
              </button>
              <button className="reschedule-btn" onClick={handleRescheduleEvent}>
                Reschedule
              </button>
            </div>
          </div>				 
        </div>
      )}
      <ToastContainer />
    </div>
  );
};

export default TimeLine;