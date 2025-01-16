import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./timeline.css"; // Custom styling for exact match

const localizer = momentLocalizer(moment);

const events = [
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
  {/* Search Box in the center */}
  <div className="search-box">
    <input type="text" placeholder="Search..." />
  </div>


    {/* Date display */}
    <span>{moment(toolbar.date).format("D MMMM YYYY")}</span>


  {/* Day/Week selection */}
  <div className="day-week-selection">
    <select>
      <option value="day">Day</option>
      <option value="week">Week</option>
    </select>
  </div>


  {/* Week Preview Dropdown */}
  <div className="week-preview">
    <select>
      <option value="preview1">Week 1</option>
      <option value="preview2">Week 2</option>
      <option value="preview3">Week 3</option>
      {/* Add more week previews as needed */}
    </select>
  </div>
</div>

  );
};

const CurrentTimeIndicator = () => {
  const [position, setPosition] = useState(null);

  useEffect(() => {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    const position = (minutes / (24 * 60)) * 100; // Calculate percentage
    setPosition(position);

    const interval = setInterval(() => {
      const now = new Date();
      const minutes = now.getHours() * 60 + now.getMinutes();
      const position = (minutes / (24 * 60)) * 100;
      setPosition(position);
    }, 60000); // Update every minute

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
  const eventStyleGetter = (event) => {
    return {
      style: {
        backgroundColor: event.color,
        color: "#fff",
        borderRadius: "5px",
        padding: "5px",
        border: "none",
        fontSize: "12px",
        textAlign: "center",
      },
    };
  };

  return (
    <div className="calendar-container">
      <CurrentTimeIndicator />
      <Calendar
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
      />
    </div>
  );
};

export default TimeLine;
