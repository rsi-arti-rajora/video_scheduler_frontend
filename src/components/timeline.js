import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./timeline.css"; // Custom styling for exact match

const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

const initialEvents = [
  {
    id: 1,
    title: "Project Demo",
    start: new Date(2025, 0, 13, 10, 40), // 10:40 AM
    end: new Date(2025, 0, 13, 11, 0),   // 11:00 AM
    color: "#3b82f6", // Blue color
  },
  {
    id: 2,
    title: "Stand-up Meeting",
    start: new Date(2025, 0, 13, 23, 0), // 11:00 PM
    end: new Date(2025, 0, 13, 23, 30),  // 11:30 PM
    color: "#f59e0b", // Orange color
  },
  {
    id: 3,
    title: "Content Planning",
    start: new Date(2025, 0, 13, 23, 0), // 11:00 PM
    end: new Date(2025, 0, 13, 23, 45),  // 11:45 PM
    color: "#10b981", // Green color
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
    const interval = setInterval(updatePosition, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="current-time-indicator"
      style={{ top: `${position}%` }}
    ></div>
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

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="calendar-container">
        <CurrentTimeIndicator />
        <DragAndDropCalendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView="week"
          views={["week"]}
          step={15}
          timeslots={4}
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
      </div>
    </DndProvider>
  );
};

export default TimeLine;
