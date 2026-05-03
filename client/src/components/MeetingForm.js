import React, { useState, useEffect } from "react";

const MeetingForm = ({ clients, onSave, onCancel, editingMeeting }) => {
  const [client, setClient] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [notes, setNotes] = useState("");
  const [recurring, setRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState("weekly");

  useEffect(() => {
    if (editingMeeting) {
      const meetingDate = new Date(editingMeeting.date);
      setClient(editingMeeting.client);
      setDate(meetingDate.toISOString().split('T')[0]);
      setTime(meetingDate.toTimeString().slice(0, 5));
      setNotes(editingMeeting.notes || "");
      setRecurring(editingMeeting.recurring || false);
      setRecurringType(editingMeeting.recurringType || "weekly");
    }
  }, [editingMeeting]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Combine date and time
    const dateTime = new Date(`${date}T${time}`);
    
    const meetingData = {
      client,
      date: dateTime,
      notes,
      recurring,
      recurringType: recurring ? recurringType : null
    };
    
    onSave(meetingData);
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-semibold mb-4">
        {editingMeeting ? 'Edit Meeting' : 'Schedule New Meeting'}
      </h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Client
          </label>
          <select 
            value={client} 
            onChange={(e) => setClient(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          >
            <option value="">Select a client</option>
            {clients.map(c => (
              <option key={c._id} value={c._id}>{c.name}</option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time
            </label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows="3"
            className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Meeting agenda, topics to discuss, etc."
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={recurring}
              onChange={(e) => setRecurring(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Recurring Meeting</span>
          </label>
          
          {recurring && (
            <select
              value={recurringType}
              onChange={(e) => setRecurringType(e.target.value)}
              className="p-1 border border-gray-300 rounded text-sm"
            >
              <option value="weekly">Weekly</option>
              <option value="biweekly">Bi-weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>
        
        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {editingMeeting ? 'Update Meeting' : 'Schedule Meeting'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MeetingForm;

