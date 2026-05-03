import React, { useEffect, useState } from "react";
import axios from "axios";
import ClientForm from "./ClientForm";
import ClientList from "./ClientList";
import AutomationPanel from "./AutomationPanel";
import { API_URL as API_BASE_URL } from "../config";

const API_URL = `${API_BASE_URL}/api/clients`;

const Clients = () => {
  const [clients, setClients] = useState([]);
  const [showAutomation, setShowAutomation] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");

  const fetchClients = async () => {
    try {
      setLoading(true);
      const res = await axios.get(API_URL, { 
        headers: { Authorization: localStorage.getItem("token") } 
      });
      setClients(res.data);
      setError("");
    } catch (err) {
      setError("Failed to fetch clients");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const addClient = async (client) => {
    try {
      await axios.post(API_URL, client, { 
        headers: { Authorization: localStorage.getItem("token") } 
      });
      fetchClients();
      setShowForm(false);
      setError("");
    } catch (err) {
      setError("Failed to add client");
    }
  };

  const deleteClient = async (id) => {
    if (window.confirm("Are you sure you want to delete this client?")) {
      try {
        await axios.delete(`${API_URL}/${id}`, { 
          headers: { Authorization: localStorage.getItem("token") } 
        });
        fetchClients();
        setError("");
      } catch (err) {
        setError("Failed to delete client");
      }
    }
  };

  const handleClientCreated = (newClient) => {
    fetchClients(); // Refresh the client list
  };

  // Get all unique tags from existing clients
  const getAllExistingTags = () => {
    const allTags = clients.flatMap(client => client.tags || []);
    return [...new Set(allTags)].sort();
  };

  // Filter and sort clients
  const filteredAndSortedClients = clients
    .filter(client => 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      const aValue = a[sortBy] || "";
      const bValue = b[sortBy] || "";
      
      if (sortOrder === "asc") {
        return aValue.toLowerCase().localeCompare(bValue.toLowerCase());
      } else {
        return bValue.toLowerCase().localeCompare(aValue.toLowerCase());
      }
    });

  const getClientStats = () => {
    return {
      total: clients.length,
      newThisMonth: clients.filter(c => {
        const clientDate = new Date(c.createdAt);
        const now = new Date();
        return clientDate.getMonth() === now.getMonth() && 
               clientDate.getFullYear() === now.getFullYear();
      }).length
    };
  };

  const stats = getClientStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Clients</h1>
          <p className="text-gray-600 mt-1">Manage your client relationships and contacts</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowAutomation(!showAutomation)}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showAutomation ? 'Hide Automation' : '🤖 Automation'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Client
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Clients</p>
              <p className="text-3xl font-bold text-blue-600">{stats.total}</p>
            </div>
            <div className="text-3xl text-blue-600">👥</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New This Month</p>
              <p className="text-3xl font-bold text-purple-600">{stats.newThisMonth}</p>
            </div>
            <div className="text-3xl text-purple-600">✨</div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Automation Panel */}
      {showAutomation && (
        <div className="bg-white rounded-lg shadow p-6">
          <AutomationPanel onClientCreated={handleClientCreated} />
        </div>
      )}

      {/* Add Client Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-800">Add New Client</h3>
            <button
              onClick={() => setShowForm(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          <ClientForm onSave={addClient} existingTags={getAllExistingTags()} />
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search clients..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Sort by Name</option>
              <option value="email">Sort by Email</option>
              <option value="phone">Sort by Contact Number</option>
              <option value="createdAt">Sort by Date Added</option>
            </select>
            
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {sortOrder === "asc" ? "↑" : "↓"}
            </button>
          </div>
        </div>
      </div>

      {/* Clients Table */}
      <ClientList 
        clients={filteredAndSortedClients} 
        onDelete={deleteClient} 
        loading={loading}
      />
    </div>
  );
};

export default Clients;
