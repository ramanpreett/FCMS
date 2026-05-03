import React, { useState } from "react";

const CalendarWidget = ({ meetings, clients }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    return { daysInMonth, startingDay };
  };

  const getMeetingsForDate = (date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      return (
        meetingDate.getDate() === date.getDate() &&
        meetingDate.getMonth() === date.getMonth() &&
        meetingDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const renderCalendarDays = () => {
    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const meetingsForDay = getMeetingsForDate(date);
      const isToday = date.toDateString() === new Date().toDateString();
      const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
      
      days.push(
        <div
          key={day}
          className={`h-8 flex items-center justify-center text-sm cursor-pointer relative ${
            isToday ? 'bg-blue-100 text-blue-800 font-semibold' : ''
          } ${
            isSelected ? 'bg-blue-200' : 'hover:bg-gray-100'
          }`}
          onClick={() => setSelectedDate(date)}
        >
          {day}
          {meetingsForDay.length > 0 && (
            <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-red-500 rounded-full"></div>
            </div>
          )}
        </div>
      );
    }
    
    return days;
  };

  const getSelectedDateMeetings = () => {
    if (!selectedDate) return [];
    return getMeetingsForDate(selectedDate);
  };

  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Calendar</h3>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <span className="text-sm font-medium">{monthName}</span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-1 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Calendar Grid */}
      <div className="mb-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-xs text-gray-500 text-center font-medium">
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {renderCalendarDays()}
        </div>
      </div>
      
      {/* Selected Date Details */}
      {selectedDate && (
        <div className="border-t pt-4">
          <h4 className="font-medium text-gray-800 mb-2">
            {formatDate(selectedDate)}
          </h4>
          
          <div className="space-y-2">
            {getSelectedDateMeetings().length === 0 ? (
              <p className="text-sm text-gray-500">No meetings scheduled</p>
            ) : (
              getSelectedDateMeetings().map(meeting => {
                const client = clients.find(c => c._id === meeting.client);
                return (
                  <div key={meeting._id} className="text-sm p-2 bg-blue-50 rounded">
                    <div className="font-medium text-blue-800">
                      {new Date(meeting.date).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })} - {client?.name || 'Unknown Client'}
                    </div>
                    {meeting.notes && (
                      <div className="text-blue-600 text-xs mt-1">
                        {meeting.notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
      
      {/* Quick Stats */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>This month: {meetings.filter(m => {
            const meetingDate = new Date(m.date);
            return meetingDate.getMonth() === currentDate.getMonth() && 
                   meetingDate.getFullYear() === currentDate.getFullYear();
          }).length} meetings</span>
          <button className="text-blue-600 hover:text-blue-800 font-medium">
            View full calendar →
          </button>
        </div>
      </div>
    </div>
  );
};

export default CalendarWidget;


