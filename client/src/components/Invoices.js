import React, { useEffect, useState } from "react";
import axios from "axios";
import InvoiceList from "./invoices/InvoiceList";
import InvoiceForm from "./invoices/InvoiceForm";
import InvoiceDetails from "./invoices/InvoiceDetails";
import InvoiceAnalytics from "./invoices/InvoiceAnalytics";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [view, setView] = useState('list'); // 'list', 'create', 'edit', 'details', 'analytics'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stats, setStats] = useState({});
  
  // Filters and search
  const [filters, setFilters] = useState({
    status: 'all',
    client: 'all',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const [sortBy, setSortBy] = useState('issueDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [filters, sortBy, sortOrder]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = { Authorization: token };

      // Fetch all data in parallel
      const [invoicesRes, clientsRes, projectsRes, statsRes] = await Promise.all([
        axios.get(`${API_URL}/api/invoices`, { headers }),
        axios.get(`${API_URL}/api/clients`, { headers }),
        axios.get(`${API_URL}/api/projects`, { headers }),
        axios.get(`${API_URL}/api/invoices/stats/dashboard`, { headers })
      ]);

      setInvoices(invoicesRes.data);
      setClients(clientsRes.data);
      setProjects(projectsRes.data);
      setStats(statsRes.data);
      setError("");
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      const token = localStorage.getItem("token");
      const params = {
        status: filters.status !== 'all' ? filters.status : undefined,
        client: filters.client !== 'all' ? filters.client : undefined,
        dateFrom: filters.dateFrom || undefined,
        dateTo: filters.dateTo || undefined,
        sortBy,
        sortOrder
      };

      // Remove undefined values
      Object.keys(params).forEach(key => 
        params[key] === undefined && delete params[key]
      );

      const response = await axios.get(`${API_URL}/api/invoices`, {
        headers: { Authorization: token },
        params
      });

      let filteredInvoices = response.data;

      // Apply search filter locally
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        filteredInvoices = filteredInvoices.filter(invoice =>
          invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
          invoice.client?.name?.toLowerCase().includes(searchLower) ||
          invoice.project?.title?.toLowerCase().includes(searchLower)
        );
      }

      setInvoices(filteredInvoices);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const addInvoice = async (invoiceData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(`${API_URL}/api/invoices`, invoiceData, {
        headers: { Authorization: token }
      });
      
      await fetchData(); // Refresh all data
      setView('list');
      setError("");
      
      // Dispatch event to notify Dashboard
      window.dispatchEvent(new CustomEvent('invoiceCreated'));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const updateInvoice = async (id, invoiceData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(`${API_URL}/api/invoices/${id}`, invoiceData, {
        headers: { Authorization: token }
      });
      
      setInvoices(invoices.map(inv => inv._id === id ? response.data : inv));
      setSelectedInvoice(response.data);
      setView('details');
      setError("");
      
      window.dispatchEvent(new CustomEvent('invoiceUpdated'));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const deleteInvoice = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/api/invoices/${id}`, {
        headers: { Authorization: token }
      });
      
      setInvoices(invoices.filter(inv => inv._id !== id));
      if (selectedInvoice?._id === id) {
        setSelectedInvoice(null);
        setView('list');
      }
      
      await fetchData(); // Refresh stats
      window.dispatchEvent(new CustomEvent('invoiceUpdated'));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const markAsPaid = async (id, paymentData) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${API_URL}/api/invoices/${id}/pay`, paymentData, {
        headers: { Authorization: token }
      });
      
      setInvoices(invoices.map(inv => inv._id === id ? response.data : inv));
      if (selectedInvoice?._id === id) {
        setSelectedInvoice(response.data);
      }
      
      await fetchData(); // Refresh stats
      window.dispatchEvent(new CustomEvent('invoiceUpdated'));
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const updateInvoiceStatus = async (id, status) => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.patch(`${API_URL}/api/invoices/${id}/status`, { status }, {
        headers: { Authorization: token }
      });
      
      setInvoices(invoices.map(inv => inv._id === id ? response.data : inv));
      if (selectedInvoice?._id === id) {
        setSelectedInvoice(response.data);
      }
      
      await fetchData(); // Refresh stats
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  };

  const generateInvoiceNumber = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.get(`${API_URL}/api/invoices/generate-number`, {
        headers: { Authorization: token }
      });
      return response.data.invoiceNumber;
    } catch (err) {
      setError("Failed to generate invoice number");
      return `INV-${new Date().getFullYear()}-0001`;
    }
  };

  const handleViewInvoice = (invoice) => {
    setSelectedInvoice(invoice);
    setView('details');
  };

  const handleEditInvoice = (invoice) => {
    if (invoice.status === 'Paid') {
      setError("Cannot edit paid invoices");
      return;
    }
    setSelectedInvoice(invoice);
    setView('edit');
  };

  const filteredInvoices = invoices;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
          <p className="text-gray-600">Manage your invoicing and payments</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => setView('analytics')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              view === 'analytics'
                ? 'bg-purple-100 text-purple-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📊 Analytics
          </button>
          
          <button
            onClick={() => setView('create')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Invoice
          </button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Render different views */}
      {view === 'list' && (
        <InvoiceList
          invoices={filteredInvoices}
          clients={clients}
          stats={stats}
          filters={filters}
          setFilters={setFilters}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onView={handleViewInvoice}
          onEdit={handleEditInvoice}
          onDelete={deleteInvoice}
          onMarkPaid={markAsPaid}
          onStatusChange={updateInvoiceStatus}
        />
      )}

      {view === 'create' && (
        <InvoiceForm
          clients={clients}
          projects={projects}
          onSave={addInvoice}
          onCancel={() => setView('list')}
          generateInvoiceNumber={generateInvoiceNumber}
        />
      )}

      {view === 'edit' && selectedInvoice && (
        <InvoiceForm
          invoice={selectedInvoice}
          clients={clients}
          projects={projects}
          onSave={(data) => updateInvoice(selectedInvoice._id, data)}
          onCancel={() => setView('details')}
          isEdit={true}
        />
      )}

      {view === 'details' && selectedInvoice && (
        <InvoiceDetails
          invoice={selectedInvoice}
          onEdit={() => handleEditInvoice(selectedInvoice)}
          onDelete={() => deleteInvoice(selectedInvoice._id)}
          onMarkAsPaid={(id) => markAsPaid(id, { paymentMethod: 'manual', transactionId: null })}
          onClose={() => setView('list')}
        />
      )}

      {view === 'analytics' && (
        <InvoiceAnalytics
          invoices={invoices}
          onBack={() => setView('list')}
        />
      )}
    </div>
  );
};

export default Invoices;
