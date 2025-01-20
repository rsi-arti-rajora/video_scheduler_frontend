import React, { useState } from 'react';
import "./mini-calendar.css";

const MiniCalendar = () => {
  const today = new Date();
  const [selectedDay, setSelectedDay] = useState(today.getDate());
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Adjust for Monday as the first day of the week
  const adjustedFirstDay = (firstDayOfMonth === 0 ? 7 : firstDayOfMonth) - 1;
  const emptyDaysBefore = [...Array(adjustedFirstDay)].map(() => null);

  const handleDayClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (selectedDate >= today) {
      setSelectedDay(day);
    }
  };

  const handlePrevMonth = () => {
    const prevMonthDate = new Date(currentYear, currentMonth - 1, 1);
    setCurrentDate(prevMonthDate);

    // Reset selected day if moving to a new month
    if (prevMonthDate.getMonth() === today.getMonth() && prevMonthDate.getFullYear() === today.getFullYear()) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(null);
    }
  };

  const handleNextMonth = () => {
    const nextMonthDate = new Date(currentYear, currentMonth + 1, 1);
    setCurrentDate(nextMonthDate);

    // Reset selected day if moving to a new month
    if (nextMonthDate.getMonth() === today.getMonth() && nextMonthDate.getFullYear() === today.getFullYear()) {
      setSelectedDay(today.getDate());
    } else {
      setSelectedDay(null);
    }
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <span className="header-title">{`${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`}</span>

        <button onClick={handlePrevMonth} className="nav-button">&lt;</button>
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
        {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map(day => {
          const isPastDate = new Date(currentYear, currentMonth, day) < today;
          return (
            <div
              key={day}
              className={`mini-calendar-day ${
                day === selectedDay &&
                currentMonth === today.getMonth() &&
                currentYear === today.getFullYear()
                  ? 'active'
                  : ''
              } ${isPastDate ? 'disabled' : ''}`}
              onClick={() => handleDayClick(day)}
              tabIndex={-1} // Prevent focusability
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MiniCalendar;
