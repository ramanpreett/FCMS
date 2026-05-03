import React, { useState, useEffect } from "react";
import axios from "axios";
import MeetingForm from "./MeetingForm";
import MeetingList from "./MeetingList";

const API_URL = process.env.REACT_APP_API_URL + "/api/meetings";
const CLIENTS_URL = process.env.REACT_APP_API_URL + "/api/clients";

const Meetings = () => {
  const [meetings, setMeetings] = useState([]);
  const [clients, setClients] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingMeeting, setEditingMeeting] = useState(null);
  const [error, setError] = useState("");

  const fetchMeetings = async () => {
    try {
      const res = await axios.get(API_URL, { headers: { Authorization: localStorage.getItem("token") } });
      setMeetings(res.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await axios.get(CLIENTS_URL, { headers: { Authorization: localStorage.getItem("token") } });
      setClients(res.data);
    } catch {}
  };

  useEffect(() => {
    fetchMeetings();
    fetchClients();
  }, []);

  const addMeeting = async (meeting) => {
    try {
      await axios.post(API_URL, meeting, { headers: { Authorization: localStorage.getItem("token") } });
      fetchMeetings();
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const updateMeeting = async (meeting) => {
    try {
      await axios.patch(`${API_URL}/${editingMeeting._id}`, meeting, { headers: { Authorization: localStorage.getItem("token") } });
      fetchMeetings();
      setEditingMeeting(null);
      setShowForm(false);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const deleteMeeting = async (id) => {
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    
    try {
      await axios.delete(`${API_URL}/${id}`, { headers: { Authorization: localStorage.getItem("token") } });
      fetchMeetings();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const handleEdit = (meeting) => {
    setEditingMeeting(meeting);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingMeeting(null);
  };

  const handleSave = (meeting) => {
    if (editingMeeting) {
      updateMeeting(meeting);
    } else {
      addMeeting(meeting);
    }
  };

  return (
    <section className="bg-white rounded shadow p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Meetings</h2>
        {!showForm && (
          <button 
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={() => setShowForm(true)}
          >
            Schedule Meeting
          </button>
        )}
      </div>
      
      {error && <div className="text-red-500 mb-4">{error}</div>}
      
      {showForm ? (
        <MeetingForm 
          clients={clients} 
          onSave={handleSave} 
          onCancel={handleCancel}
          editingMeeting={editingMeeting}
        />
      ) : (
        <MeetingList 
          meetings={meetings} 
          clients={clients} 
          onDelete={deleteMeeting} 
          onEdit={handleEdit}
        />
      )}
    </section>
  );
};

export default Meetings;
