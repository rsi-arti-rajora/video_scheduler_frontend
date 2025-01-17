import React, { useState } from 'react';
import "./mini-calendar.css";

const MiniCalendar = () => {
  const [selectedDay, setSelectedDay] = useState(null);
  // Initialize with January 2025
  const [currentDate, setCurrentDate] = useState(new Date(2025, 0, 1));

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Create arrays for days and empty spaces
  const days = [...Array(totalDaysInMonth)].map((_, index) => index + 1);
  const emptyDaysBefore = [...Array(firstDayOfMonth)].map((_, index) => null);

  const handleDayClick = (day) => {
    setSelectedDay(day);
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <button onClick={handlePrevMonth} className="nav-button">&lt;</button>
        <span>{`${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`}</span>
        <button onClick={handleNextMonth} className="nav-button">&gt;</button>
      </div>
      <div className="mini-calendar-grid">
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(day => (
          <div key={day} className="mini-calendar-day header">
            {day}
          </div>
        ))}
        {emptyDaysBefore.map((_, index) => (
          <div key={`empty-${index}`} className="mini-calendar-day empty"></div>
        ))}
        {days.map(day => (
          <div
            key={day}
            className={`mini-calendar-day ${day === selectedDay ? 'active' : ''}`}
            onClick={() => handleDayClick(day)}
          >
            {day}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MiniCalendar;