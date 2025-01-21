import React, { useState, useEffect, useMemo } from 'react';
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

const TimeLine = () => {
  const [events, setEvents] = useState([]);
  const [isSaveVisible, setSaveVisible] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date()); // Track the current time for the current time line
  
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
    drop: (item, monitor) => {
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

      const dayHeaders = document?.querySelectorAll(".rbc-header");
      const dayWidth = dayHeaders[0].offsetWidth;
      const startX = dayHeaders[0].getBoundingClientRect().left;
      const dayIndex = Math.floor((x - startX) / dayWidth);
      const spanValue = dayHeaders[dayIndex]?.querySelector('span')?.textContent.trim();

      const day = parseInt(spanValue?.split(" ")[0] || new Date().getDate(), 10);
      const currentDate = new Date();
      const dropDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day, hours, minutes, seconds);

      const durationInMs = Math.round(item.duration) * 1000;
      let dropEndTime = new Date(dropDate.getTime() + durationInMs);

      // Prevent overlapping events
      const hasOverlap = events.some(
        (event) =>
          (dropDate >= event.start && dropDate < event.end) ||
          (dropEndTime > event.start && dropEndTime <= event.end)
      );

      // If overlap, find the next available time slot
      if (hasOverlap) {
        const sortedEvents = [...events].sort((a, b) => a.start - b.start()); // Sort by start time
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
    },
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
        step={15}
        timeslots={1}
        scrollToTime={new Date()}
        resizable={false} // Disable resizing
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
      />
      <ToastContainer />
    </div>
  );
};

export default TimeLine;