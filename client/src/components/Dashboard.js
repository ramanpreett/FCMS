
import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL } from "../config";
import QuickStats from "./dashboard/QuickStats";
import RecentActivity from "./dashboard/RecentActivity";
import TaskList from "./dashboard/TaskList";
import CalendarWidget from "./dashboard/CalendarWidget";
import FinancialSnapshot from "./dashboard/FinancialSnapshot";
import PlatformInsights from "./dashboard/PlatformInsights";
import QuickActions from "./dashboard/QuickActions";
import AIInsights from "./dashboard/AIInsights";

const Dashboard = ({ onPageChange }) => {
  const [dashboardData, setDashboardData] = useState({
    stats: {
      totalClients: 0,
      activeProjects: 0,
      pendingInvoices: 0,
      upcomingMeetings: 0
    },
    recentActivity: [],
    tasks: [],
    meetings: [],
    clients: [],
    invoices: [],
    projects: [],
    financialData: {
      monthlyIncome: 0,
      pendingPayments: 0,
      recurringRevenue: 0,
      revenueByClient: [],
      revenueByPlatform: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdated, setLastUpdated] = useState(null);

  const baseUrl = API_URL;

  useEffect(() => {
    fetchDashboardData();
    
    // Listen for updates from other pages
    const handleDataUpdate = () => {
      fetchDashboardData();
    };
    
    // Add event listeners for data updates
    window.addEventListener('invoiceUpdated', handleDataUpdate);
    window.addEventListener('invoiceCreated', handleDataUpdate);
    window.addEventListener('projectUpdated', handleDataUpdate);
    window.addEventListener('projectCreated', handleDataUpdate);
    window.addEventListener('clientUpdated', handleDataUpdate);
    window.addEventListener('clientCreated', handleDataUpdate);
    
    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener('invoiceUpdated', handleDataUpdate);
      window.removeEventListener('invoiceCreated', handleDataUpdate);
      window.removeEventListener('projectUpdated', handleDataUpdate);
      window.removeEventListener('projectCreated', handleDataUpdate);
      window.removeEventListener('clientUpdated', handleDataUpdate);
      window.removeEventListener('clientCreated', handleDataUpdate);
    };
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: token ? `Bearer ${token}` : "" };

      // Fetch all data in parallel
      const [clientsRes, invoicesRes, meetingsRes, projectsRes] = await Promise.all([
        axios.get(`${baseUrl}/api/clients`, { headers }),
        axios.get(`${baseUrl}/api/invoices`, { headers }),
        axios.get(`${baseUrl}/api/meetings`, { headers }),
        axios.get(`${baseUrl}/api/projects`, { headers })
      ]);

      const clients = clientsRes.data || [];
      const invoices = invoicesRes.data || [];
      const meetings = meetingsRes.data || [];
      const projects = projectsRes.data || [];

      // Calculate stats
      const stats = {
        totalClients: clients.length,
        activeProjects: projects.filter(p => p && p.status === 'Active').length,
        pendingInvoices: invoices.filter(i => i && i.status === 'Pending').length,
        upcomingMeetings: meetings.filter(m => m && m.date && new Date(m.date) > new Date()).length
      };

      // Generate recent activity
      const recentActivity = generateRecentActivity(clients, invoices, meetings, projects);

      // Generate tasks
      const tasks = generateTasks(invoices, meetings, clients, projects);

      // Calculate financial data
      const financialData = calculateFinancialData(invoices, clients, projects);

      setDashboardData({
        stats,
        recentActivity,
        tasks,
        meetings,
        clients,
        invoices,
        projects,
        financialData
      });

      setLastUpdated(new Date());
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateRecentActivity = (clients, invoices, meetings, projects) => {
    const activities = [];
    const now = new Date();
    
    // Ensure all parameters are arrays
    const safeClients = Array.isArray(clients) ? clients : [];
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const safeMeetings = Array.isArray(meetings) ? meetings : [];
    const safeProjects = Array.isArray(projects) ? projects : [];
    
    // Add recent client activities
    safeClients.slice(0, 5).forEach(client => {
      const clientDate = new Date(client.createdAt || now);
      activities.push({
        id: `client-${client._id}`,
        type: 'client',
        title: `New client added: ${client.name}`,
        description: `Client from ${client.source || 'Manual'} source`,
        date: clientDate,
        icon: '👤',
        color: 'blue'
      });
    });

    // Add recent invoice activities
    safeInvoices.slice(0, 5).forEach(invoice => {
      if (!invoice || !invoice.client) return; // Skip if invoice or client is null
      const client = safeClients.find(c => c && c._id === invoice.client);
  const isPaid = invoice.status === 'Paid';
      
      // Use updatedAt for paid invoices (when status changed) and createdAt for new invoices
      const activityDate = isPaid 
        ? new Date(invoice.updatedAt || invoice.createdAt || now)
        : new Date(invoice.createdAt || now);
      
      activities.push({
        id: `invoice-${invoice._id}-${isPaid ? 'paid' : 'created'}`,
        type: 'invoice',
  title: `Invoice ${isPaid ? 'paid' : 'created'}: $${invoice.total}`,
        description: `For ${client?.name || 'Unknown client'}`,
        date: activityDate,
        icon: isPaid ? '💰' : '📄',
        color: isPaid ? 'green' : 'orange'
      });
    });

    // Add recent meeting activities
    safeMeetings.slice(0, 3).forEach(meeting => {
      if (!meeting || !meeting.client) return; // Skip if meeting or client is null
      const client = safeClients.find(c => c && c._id === meeting.client);
      const meetingDate = new Date(meeting.date);
      const isUpcoming = meetingDate > now;
      
      activities.push({
        id: `meeting-${meeting._id}`,
        type: 'meeting',
        title: `Meeting ${isUpcoming ? 'scheduled' : 'completed'} with ${client?.name || 'Unknown client'}`,
        description: meeting.notes || 'No notes',
        date: meetingDate,
        icon: isUpcoming ? '📅' : '✅',
        color: isUpcoming ? 'purple' : 'green'
      });
    });

    // Add recent project activities
    safeProjects.slice(0, 5).forEach(project => {
      if (!project || !project.client) return; // Skip if project or client is null
      const client = safeClients.find(c => c && c._id === project.client);
      const isCompleted = project.status === 'Completed';
      const isActive = project.status === 'Active';
      
      // Use updatedAt for status changes, createdAt for new projects
      const activityDate = (isCompleted || isActive) 
        ? new Date(project.updatedAt || project.createdAt || now)
        : new Date(project.createdAt || now);
      
      activities.push({
        id: `project-${project._id}-${project.status.toLowerCase()}`,
        type: 'project',
        title: `Project ${project.status.toLowerCase()}: ${project.name}`,
        description: `For ${client?.name || 'Unknown client'} - ${project.progress}% complete`,
        date: activityDate,
        icon: isActive ? '🚀' : isCompleted ? '✅' : '⏸️',
        color: isActive ? 'green' : isCompleted ? 'purple' : 'yellow'
      });
    });


    // Sort by date and return top 10
    return activities
      .sort((a, b) => b.date - a.date)
      .slice(0, 10);
  };

  const generateTasks = (invoices, meetings, clients, projects) => {
    const tasks = [];
    
    // Ensure all parameters are arrays
    const safeInvoices = Array.isArray(invoices) ? invoices : [];
    const safeMeetings = Array.isArray(meetings) ? meetings : [];
    const safeClients = Array.isArray(clients) ? clients : [];
    const safeProjects = Array.isArray(projects) ? projects : [];

    // Overdue invoices
    const overdueInvoices = safeInvoices.filter(invoice => {
      if (!invoice || !invoice.dueDate || invoice.status === 'Paid') return false;
      const dueDate = new Date(invoice.dueDate);
      return dueDate < new Date();
    });

    overdueInvoices.forEach(invoice => {
      if (!invoice || !invoice.client) return; // Skip if invoice or client is null
      const client = safeClients.find(c => c && c._id === invoice.client);
      tasks.push({
        id: `overdue-${invoice._id}`,
        title: `Follow up on overdue invoice`,
  description: `Invoice #${invoice._id.slice(-8)} for ${client?.name || 'Unknown client'} - $${invoice.total}`,
        priority: 'high',
        dueDate: new Date(invoice.dueDate),
        type: 'invoice',
        action: 'follow-up'
      });
    });

    // Upcoming meetings
    const upcomingMeetings = safeMeetings.filter(meeting => {
      if (!meeting || !meeting.date) return false;
      const meetingDate = new Date(meeting.date);
      const now = new Date();
      const diffHours = (meetingDate - now) / (1000 * 60 * 60);
      return diffHours > 0 && diffHours <= 24; // Next 24 hours
    });

    upcomingMeetings.forEach(meeting => {
      if (!meeting || !meeting.client) return; // Skip if meeting or client is null
      const client = clients.find(c => c._id === meeting.client);
      tasks.push({
        id: `meeting-${meeting._id}`,
        title: `Prepare for meeting`,
        description: `Meeting with ${client?.name || 'Unknown client'} at ${new Date(meeting.date).toLocaleTimeString()}`,
        priority: 'medium',
        dueDate: new Date(meeting.date),
        type: 'meeting',
        action: 'prepare'
      });
    });



    // Project tasks
    const activeProjects = projects.filter(project => project && project.status === 'Active');
    activeProjects.forEach(project => {
      if (!project || !project.client) return; // Skip if project or client is null
      const client = clients.find(c => c._id === project.client);
      const deadline = new Date(project.deadline);
      const now = new Date();
      const diffTime = deadline - now;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let priority = 'low';
      if (diffDays < 0) priority = 'high'; // Overdue
      else if (diffDays <= 3) priority = 'high';
      else if (diffDays <= 7) priority = 'medium';
      
      tasks.push({
        id: `project-${project._id}`,
        title: `Work on ${project.name}`,
        description: `${project.progress}% complete - ${project.description || 'No description'}`,
        priority,
        dueDate: project.deadline,
        type: 'project',
        action: 'work-on'
      });
    });

    return tasks.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const calculateFinancialData = (invoices, clients, projects) => {
    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    
    // Monthly income (paid invoices this month)
    // Use updatedAt for when the invoice was marked as paid, fallback to createdAt
    const monthlyIncome = invoices
      .filter(invoice => 
        invoice && 
        invoice.status === 'Paid' && 
        new Date(invoice.updatedAt || invoice.createdAt || Date.now()) >= thisMonth
      )
    .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    // Pending payments
    const pendingPayments = invoices
      .filter(invoice => invoice && invoice.status === 'Pending')
      .reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    // Revenue by client
    const revenueByClient = clients.map(client => {
      if (!client || !client._id) return { name: 'Unknown', revenue: 0, invoices: 0 };
      const clientInvoices = invoices.filter(invoice => {
        if (!invoice || !invoice.client) return false;
        const invoiceClientId = typeof invoice.client === 'string' ? invoice.client : invoice.client._id;
        return invoiceClientId === client._id && invoice.status === 'Paid';
      });
  const totalRevenue = clientInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      
      
      return {
        name: client.name,
        revenue: totalRevenue,
        invoices: clientInvoices.length
      };
    }).filter(item => item.revenue > 0).sort((a, b) => b.revenue - a.revenue);

    // Revenue by platform
    const platformRevenue = {};
    clients.forEach(client => {
      if (!client || !client._id) return;
      const source = client.source || 'Direct';
      const clientInvoices = invoices.filter(invoice => {
        if (!invoice || !invoice.client) return false;
        const invoiceClientId = typeof invoice.client === 'string' ? invoice.client : invoice.client._id;
        return invoiceClientId === client._id && invoice.status === 'Paid';
      });
  const revenue = clientInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
      
      
      platformRevenue[source] = (platformRevenue[source] || 0) + revenue;
    });

    const revenueByPlatform = Object.entries(platformRevenue).map(([platform, revenue]) => ({
      platform,
      revenue
    }));

    // Calculate recurring revenue from projects with recurring payments
    const recurringRevenue = projects
      .filter(project => 
        project && 
        project.status === 'Active' && 
        project.paymentStatus === 'Paid' && 
        project.recurring === true
      )
      .reduce((sum, project) => sum + (project.monthlyAmount || project.budget || 0), 0);

    return {
      monthlyIncome,
      pendingPayments,
      recurringRevenue,
      revenueByClient,
      revenueByPlatform
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-gray-600">Loading dashboard...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Refreshing...' : '🔄 Refresh'}
          </button>
          <div className="text-sm text-gray-500">
            Last updated: {lastUpdated ? lastUpdated.toLocaleString() : 'Never'}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <QuickStats stats={dashboardData.stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Financial Snapshot */}
          <FinancialSnapshot data={dashboardData.financialData} />
          
          {/* Platform Insights */}
          <PlatformInsights 
            clients={dashboardData.clients}
            revenueByPlatform={dashboardData.financialData.revenueByPlatform}
          />
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <QuickActions onPageChange={onPageChange} />
          
          {/* AI Insights */}
          <AIInsights 
            clients={dashboardData.clients}
            invoices={dashboardData.invoices}
            tasks={dashboardData.tasks}
          />
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <RecentActivity activities={dashboardData.recentActivity} onPageChange={onPageChange} />
        
        {/* Tasks */}
        <TaskList tasks={dashboardData.tasks} onTaskUpdate={fetchDashboardData} onPageChange={onPageChange} />
      </div>

      {/* Calendar Widget */}
      <CalendarWidget meetings={dashboardData.meetings} clients={dashboardData.clients} />
    </div>
  );
};

export default Dashboard;
