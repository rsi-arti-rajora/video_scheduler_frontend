import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import { useDrop } from "react-dnd"; // Added missing import
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./timeline.css";

const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

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

const TimeLine = () => {
  const [events, setEvents] = useState([]);

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

  const CalendarWithDrop = ({ children, onDrop }) => {
    const [, drop] = useDrop({
      accept: "VIDEO_FILE",
      drop: (item, monitor) => {
        console.log(item, "gdgfjdgsj", monitor);
        const calendarElement = document.querySelector(".calendar-container");
        const bounds = calendarElement.getBoundingClientRect();
        const { y } = monitor.getClientOffset();

        const relativeY = y - bounds.top;

        if (relativeY < 0 || relativeY > bounds.height) {
          console.warn("Dropped outside calendar area");
          return;
        }

        const totalMinutes = ((relativeY / bounds.height) * 4 * 60); // Scale it to 4 hours (10 AM to 2 PM)
        const hours = Math.floor(totalMinutes / 60) + 10; // Offset by 10 AM
        const minutes = Math.floor(totalMinutes % 60 / 15) * 15; // Round to nearest 15 minutes

        const dropTime = new Date();
        dropTime.setHours(hours, minutes, 0, 0);

        console.log(dropTime, "dropTime", item);

        // Call onDrop callback with item and the calculated drop time
        onDrop(item, dropTime);
      },
    });

    return (
      <div ref={drop} className="calendar-container">
        {children}
      </div>
    );
  };

  const onDrop = (item, dropTime) => {
    const newEvent = {
      id: Date.now(),
      title: item.file_name,
      start: dropTime,
      end: new Date(dropTime.getTime() + (item.duration || 15 * 60000)), // Default 15min if no duration
      color: "#3b82f6",
    };

    setEvents([...events, newEvent]);
  };

  return (
    <CalendarWithDrop onDrop={onDrop}> {/* Passing onDrop here */}
      <DragAndDropCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        defaultView="week"
        views={["week"]}
        step={60} // 1-hour interval
        timeslots={1}
        min={moment().set({ hour: 10, minute: 0, second: 0 }).toDate()} // Start at 10 AM
        max={moment().set({ hour: 20, minute: 0, second: 0 }).toDate()} // End at 2 PM
        components={{
          toolbar: CustomToolbar,
        }}
        eventPropGetter={eventStyleGetter}
        onEventDrop={onEventDrop}
        onEventResize={onEventResize}
      />
    </CalendarWithDrop>
  );
};

export default TimeLine;
