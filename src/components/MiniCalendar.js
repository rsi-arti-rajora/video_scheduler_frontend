import React, { useState } from 'react';
import './mini-calendar.css';

const MiniCalendar = ({ selectedDay, onDateChange }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time to 00:00:00 for comparison

  // Local state to track the current displayed month/year
  const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Adjust for Monday as the first day of the week
  const adjustedFirstDay = (firstDayOfMonth === 0 ? 7 : firstDayOfMonth) - 1;
  const emptyDaysBefore = [...Array(adjustedFirstDay)].map(() => null);

  // Handle clicking on a specific day
  const handleDayClick = (day) => {
    const selectedDate = new Date(currentYear, currentMonth, day);
    if (selectedDate.getTime() >= today.getTime()) {
      onDateChange(selectedDate); // Use the `onDateChange` callback to update the selected day
    }
  };

  // Navigate to the previous month
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  // Navigate to the next month
  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  return (
    <div className="mini-calendar">
      <div className="mini-calendar-header">
        <span className="header-title">
          {`${currentDate.toLocaleString('default', { month: 'long' })} ${currentYear}`}
        </span>
        <button onClick={handlePrevMonth} className="nav-button">&lt;</button>
        <button onClick={handleNextMonth} className="nav-button">&gt;</button>
      </div>
      <div className="mini-calendar-grid">
        {/* Days of the week */}
        {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day) => (
          <div key={day} className="mini-calendar-day header">
            {day}
          </div>
        ))}
        {/* Empty slots for days before the 1st of the month */}
        {emptyDaysBefore.map((_, index) => (
          <div key={`empty-${index}`} className="mini-calendar-day empty"></div>
        ))}
        {/* Days in the current month */}
        {Array.from({ length: totalDaysInMonth }, (_, i) => i + 1).map((day) => {
          const isToday =
            day === today.getDate() &&
            currentMonth === today.getMonth() &&
            currentYear === today.getFullYear();
          const isSelected =
            selectedDay &&
            day === selectedDay.getDate() &&
            currentMonth === selectedDay.getMonth() &&
            currentYear === selectedDay.getFullYear();
          const isPastDate = new Date(currentYear, currentMonth, day) < today;

          return (
            <div
              key={day}
              className={`mini-calendar-day 
                ${isToday ? 'today' : ''} 
                ${isSelected ? 'active' : ''} 
                ${isPastDate ? 'disabled' : ''}`}
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
