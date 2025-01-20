import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useDrop } from "react-dnd";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./timeline.css";

const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

// Get current date for initial events
const today = new Date();
const initialEvents = [
  {
    id: 1,
    title: "Project Demo",
    start: new Date(today.setHours(10, 40, 0, 0)),
    end: new Date(today.setHours(11, 0, 0, 0)),
    color: "#3b82f6",
  },
  {
    id: 2,
    title: "Stand-up Meeting",
    start: new Date(today.setHours(23, 0, 0, 0)),
    end: new Date(today.setHours(23, 30, 0, 0)),
    color: "#f59e0b",
  },
  {
    id: 3,
    title: "Content Planning",
    start: new Date(today.setHours(23, 0, 0, 0)),
    end: new Date(today.setHours(23, 45, 0, 0)),
    color: "#10b981",
  },
];

const CustomToolbar = (toolbar) => {
  return (
    <div className="custom-toolbar">
      <div className="search-box">
        <input type="text" placeholder="Search..." />
      </div>
      <span>{moment(toolbar.date).format("D MMMM YYYY")}</span>
      <div className="day-week-selection">
        <select>
          <option value="day">Day</option>
          <option value="week">Week</option>
        </select>
      </div>
      <div className="week-preview">
        <select>
          <option value="preview1">Week 1</option>
          <option value="preview2">Week 2</option>
          <option value="preview3">Week 3</option>
        </select>
      </div>
    </div>
  );
};

const CurrentTimeIndicator = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const updatePosition = () => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const position = (minutes / (24 * 60)) * 100;
      setPosition(position);
    };

    updatePosition();
    const interval = setInterval(updatePosition, 60000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="current-time-indicator"
      style={{ top: `${position}%` }}
    ></div>
  );
};

const CalendarWithDrop = ({ children, onDrop }) => {
  const [, drop] = useDrop({
    accept: "VIDEO_FILE",
    drop: (item, monitor) => {
      const calendarElement = document.querySelector(".rbc-time-content");
      if (!calendarElement) return;

      const bounds = calendarElement.getBoundingClientRect();
      const { y } = monitor.getClientOffset();
      const scrollTop = calendarElement.scrollTop;

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
      
      // Create the drop time using current date
      const dropTime = new Date();
      dropTime.setHours(hours, minutes, 0, 0);

      // Debug information
      console.log("Drop Calculations:", {
        relativeY,
        totalHeight,
        percentageOfDay: percentageOfDay.toFixed(4),
        minutesSinceMidnight,
        calculatedTime: `${hours}:${minutes.toString().padStart(2, '0')}`,
        scrollTop,
        bounds: {
          top: bounds.top,
          height: bounds.height
        }
      });

      onDrop(item, dropTime);
    },
  });

  return (
    <div ref={drop} className="calendar-container">
      {children}
    </div>
  );
};

const TimeLine = () => {
  const [events, setEvents] = useState(initialEvents);

  const onEventDrop = ({ event, start, end }) => {
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    );
    setEvents(updatedEvents);
  };

  const onEventResize = ({ event, start, end }) => {
    const updatedEvents = events.map((existingEvent) =>
      existingEvent.id === event.id
        ? { ...existingEvent, start, end }
        : existingEvent
    );
    setEvents(updatedEvents);
  };

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: event.color,
      color: "#fff",
      borderRadius: "5px",
      padding: "5px",
      border: "none",
      fontSize: "12px",
      textAlign: "center",
    },
  });

  const onDrop = (item, dropTime) => {
    const durationInMs = item.duration * 1000; // Convert seconds to milliseconds
    const newEvent = {
      id: Date.now(),
      title: item.file_name,
      start: dropTime,
      end: new Date(
        dropTime.getTime() + (durationInMs || 15 * 60000)
      ), // Default 15min if no duration
      color: "#3b82f6",
    };
    console.log("vikas new event", newEvent);
    setEvents(prevEvents => [...prevEvents, newEvent]);
  };

  // Calculate default scroll position to show current time
  const currentTime = new Date();
  const defaultScrollTime = new Date(currentTime);
  defaultScrollTime.setHours(currentTime.getHours() - 1); // 1 hour before current time

  return (
    <CalendarWithDrop onDrop={onDrop}>
      <CurrentTimeIndicator />
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="day"
        views={["day"]}
        step={15}
        timeslots={1}
        defaultDate={new Date()} // Set to current date
        scrollToTime={defaultScrollTime}
        min={new Date().setHours(0, 0, 0, 0)} // Start of today
        max={new Date().setHours(23, 59, 59, 999)} // End of today
        components={{
          toolbar: CustomToolbar,
        }}
        style={{
          height: "600px",
          margin: "20px auto",
          backgroundColor: "#fff",
          border: "1px solid #ddd",
          borderRadius: "10px",
          padding: "10px",
        }}
        eventPropGetter={eventStyleGetter}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
        resizable
      />
    </CalendarWithDrop>
  );
};

export default TimeLine;