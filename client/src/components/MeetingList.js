import React from "react";

const MeetingList = ({ meetings, clients, onDelete, onEdit }) => {
  const formatDateTime = (date) => {
    const meetingDate = new Date(date);
    const now = new Date();
    const isToday = meetingDate.toDateString() === now.toDateString();
    const isPast = meetingDate < now;
    
    const dateStr = isToday ? 'Today' : meetingDate.toLocaleDateString();
    const timeStr = meetingDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return { dateStr, timeStr, isPast };
  };

  const getStatusColor = (date) => {
    const { isPast } = formatDateTime(date);
    return isPast ? 'text-gray-500' : 'text-blue-600';
  };

  const getStatusBadge = (date) => {
    const { isPast } = formatDateTime(date);
    if (isPast) {
      return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Completed</span>;
    }
    return <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">Upcoming</span>;
  };

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold">Scheduled Meetings</h3>
      
      {meetings.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No meetings scheduled</p>
          <p className="text-sm">Click "Schedule Meeting" to add your first meeting</p>
        </div>
      ) : (
        <div className="space-y-3">
          {meetings
            .sort((a, b) => new Date(a.date) - new Date(b.date))
            .map(meeting => {
              const client = clients.find(c => c._id === meeting.client);
              const { dateStr, timeStr, isPast } = formatDateTime(meeting.date);
              
              return (
                <div 
                  key={meeting._id} 
                  className={`border rounded-lg p-4 ${isPast ? 'bg-gray-50' : 'bg-white'} hover:shadow-md transition-shadow`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-lg">
                          {client ? client.name : 'Unknown Client'}
                        </h4>
                        {getStatusBadge(meeting.date)}
                        {meeting.recurring && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                            {meeting.recurringType}
                          </span>
                        )}
                      </div>
                      
                      <div className={`text-lg font-medium ${getStatusColor(meeting.date)}`}>
                        {dateStr} at {timeStr}
                      </div>
                      
                      {meeting.notes && (
                        <div className="mt-2 text-sm text-gray-600">
                          <strong>Notes:</strong> {meeting.notes}
                        </div>
                      )}
                      
                      <div className="mt-2 text-xs text-gray-500">
                        Meeting ID: {meeting._id.slice(-8)}
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      {!isPast && (
                        <button 
                          className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                          onClick={() => onEdit(meeting)}
                        >
                          Edit
                        </button>
                      )}
                      <button 
                        className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600"
                        onClick={() => onDelete(meeting._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default MeetingList;

