import React, { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Events array need to replace with get api which will give schedule event list
const events = [
  {
    id: 1,
    title: "Project Demo",
    start: new Date(2025, 0, 14, 10, 40), // January 14, 2025, 10:40 AM
    end: new Date(2025, 0, 14, 11, 0),   // January 14, 2025, 11:00 AM
    color: "#3b82f6", // Blue
  },
  {
    id: 2,
    title: "Stand-up Meeting",
    start: new Date(2025, 0, 14, 23, 0), // January 14, 2025, 11:00 PM
    end: new Date(2025, 0, 14, 23, 30),  // January 14, 2025, 11:30 PM
    color: "#f59e0b", // Orange
  },
  {
    id: 3,
    title: "Content Planning",
    start: new Date(2025, 0, 14, 23, 0), // January 14, 2025, 11:00 PM
    end: new Date(2025, 0, 14, 23, 45),  // January 14, 2025, 11:45 PM
    color: "#10b981", // Green
  },
];

// Localizer for date/time formatting
const localizer = momentLocalizer(moment);

const CustomCalendar = () => {
  const [calendarEvents, setCalendarEvents] = useState(events);

  // Custom styling for events
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: "white",
        borderRadius: "5px",
        padding: "5px",
      },
    };
  };

  return (
    <div style={{ height: "80vh", margin: "20px" }}>
      <h2 style={{ textAlign: "center" }}>Content Scheduling</h2>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        defaultView="week" // Week view as default
        views={["week", "day", "agenda"]}
        step={15} // 10-minute step interval
        timeslots={6} // 1-hour divided into 10-minute slots
        style={{ height: 500, margin: "20px" }}
        eventPropGetter={eventStyleGetter}
      />
    </div>
  );
};

export default CustomCalendar;
