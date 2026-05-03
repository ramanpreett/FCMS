import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import ProjectList from "./projects/ProjectList";
import ProjectDetails from "./projects/ProjectDetails";
import ProjectKanban from "./projects/ProjectKanban";
import ProjectAnalytics from "./projects/ProjectAnalytics";
import ProjectForm from "./projects/ProjectForm";

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'details', 'kanban', 'analytics'
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filters, setFilters] = useState({
    status: 'all',
    paymentStatus: 'all',
    client: 'all'
  });
  const [sortBy, setSortBy] = useState('deadline');

  useEffect(() => {
    fetchData();
    
    // Add event listener for when user returns to the tab/window
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchData();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Cleanup event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const fetchData = async () => {
    try {
      console.log('Projects: Fetching data...');
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: token };

      // Fetch projects and clients in parallel
      const [projectsRes, clientsRes] = await Promise.all([
        axios.get(`${API_URL}/api/projects`, { headers }),
        axios.get(`${API_URL}/api/clients`, { headers })
      ]);

      console.log('Projects: Fetched projects:', projectsRes.data.length);
      console.log('Projects: Fetched clients:', clientsRes.data.length);
      console.log('Projects: Sample project client data:', projectsRes.data[0]?.client);
      
      setProjects(projectsRes.data);
      setClients(clientsRes.data);
      setError("");
    } catch (err) {
      console.error('Projects: Error fetching data:', err);
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const addProject = async (projectData) => {
    try {
      console.log('Projects: Creating new project with data:', projectData);
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/projects`, projectData, {
        headers: { Authorization: token }
      });
      
      console.log('Projects: Created project response:', response.data);
      console.log('Projects: Created project client data:', response.data.client);
      
      // Refresh the entire project list to ensure proper client population
      await fetchData();
      setShowForm(false);
      setError("");
    } catch (err) {
      console.error('Projects: Error creating project:', err);
      setError(err.response?.data?.error || err.message);
    }
  };

  const updateProject = async (id, projectData) => {
    try {
      const token = localStorage.getItem("token");
      // Try to use PATCH with minimal headers to avoid CORS preflight
      const response = await axios.patch(`${API_URL}/api/projects/${id}`, projectData, {
        headers: { 
          Authorization: token
        }
      });
      setProjects(projects.map(p => p._id === id ? response.data : p));
      setSelectedProject(response.data);
      setError("");
    } catch (err) {
      console.error('PATCH failed, trying alternative approach:', err);
      // If PATCH fails, try using a different approach
      // For now, just update the local state without server sync
      setProjects(projects.map(p => p._id === id ? { ...p, ...projectData } : p));
      setSelectedProject({ ...projects.find(p => p._id === id), ...projectData });
      setError("Server update failed, but local changes saved. Please refresh to sync with server.");
    }
  };

  const deleteProject = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/projects/${id}`, {
        headers: { Authorization: token }
      });
      setProjects(projects.filter(p => p._id !== id));
      if (selectedProject?._id === id) {
        setSelectedProject(null);
        setView('list');
      }
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const getProjectStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const overdueProjects = projects.filter(p => {
      if (p.status === 'Completed') return false;
      return new Date(p.deadline) < new Date();
    }).length;

    const totalRevenue = projects
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const pendingRevenue = projects
      .filter(p => p.paymentStatus === 'Pending')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalRevenue,
      pendingRevenue
    };
  };

  const getFilteredAndSortedProjects = () => {
    let filtered = projects;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(p => p.status === filters.status);
    }
    if (filters.paymentStatus !== 'all') {
      filtered = filtered.filter(p => p.paymentStatus === filters.paymentStatus);
    }
    if (filters.client !== 'all') {
      filtered = filtered.filter(p => p.client === filters.client);
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'deadline':
          return new Date(a.deadline) - new Date(b.deadline);
        case 'client':
          const clientA = clients.find(c => c._id === a.client)?.name || '';
          const clientB = clients.find(c => c._id === b.client)?.name || '';
          return clientA.localeCompare(clientB);
        case 'paymentStatus':
          return a.paymentStatus.localeCompare(b.paymentStatus);
        case 'status':
          return a.status.localeCompare(b.status);
        case 'budget':
          return (b.budget || 0) - (a.budget || 0);
        default:
          return 0;
      }
    });

    return filtered;
  };

  const stats = getProjectStats();
  const filteredProjects = getFilteredAndSortedProjects();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading projects...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Projects</h1>
          <p className="text-gray-600 mt-1">Manage your projects and track progress</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            + New Project
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeProjects}</p>
            </div>
            <div className="text-2xl text-green-600">🚀</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdueProjects}</p>
            </div>
            <div className="text-2xl text-red-600">⚠️</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Revenue</p>
              <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-2xl text-green-600">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-orange-600">${stats.pendingRevenue.toLocaleString()}</p>
            </div>
            <div className="text-2xl text-orange-600">⏳</div>
          </div>
        </div>
      </div>

      {/* View Toggle and Filters */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'list' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 List
            </button>
            <button
              onClick={() => setView('kanban')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'kanban' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📋 Kanban
            </button>
            <button
              onClick={() => setView('analytics')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                view === 'analytics' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              📊 Analytics
            </button>
          </div>

          {/* Filters and Sort */}
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Completed">Completed</option>
              <option value="On Hold">On Hold</option>
              <option value="Cancelled">Cancelled</option>
            </select>

            <select
              value={filters.paymentStatus}
              onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Partially Paid">Partially Paid</option>
            </select>

            <select
              value={filters.client}
              onChange={(e) => setFilters({...filters, client: e.target.value})}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Clients</option>
              {clients.map(client => (
                <option key={client._id} value={client._id}>{client.name}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="client">Sort by Client</option>
              <option value="status">Sort by Status</option>
              <option value="paymentStatus">Sort by Payment</option>
              <option value="budget">Sort by Budget</option>
            </select>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Add Project Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <ProjectForm 
            clients={clients}
            onSave={addProject}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Main Content */}
      {view === 'list' && (
        <ProjectList
          projects={filteredProjects}
          clients={clients}
          onProjectClick={(project) => {
            setSelectedProject(project);
            setView('details');
          }}
          onDelete={deleteProject}
          onUpdate={updateProject}
        />
      )}

      {view === 'details' && selectedProject && (
        <ProjectDetails
          project={selectedProject}
          clients={clients}
          onBack={() => {
            setSelectedProject(null);
            setView('list');
          }}
          onUpdate={updateProject}
          onDelete={deleteProject}
        />
      )}

      {view === 'kanban' && (
        <ProjectKanban
          projects={filteredProjects}
          clients={clients}
          onProjectClick={(project) => {
            setSelectedProject(project);
            setView('details');
          }}
          onUpdate={updateProject}
        />
      )}

      {view === 'analytics' && (
        <ProjectAnalytics
          projects={projects}
          clients={clients}
          stats={stats}
        />
      )}
    </div>
  );
};

export default Projects;


