import React, { useState } from "react";

const ProjectDetails = ({ project, clients, onBack, onUpdate, onDelete }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState(project);

  const client = clients.find(c => c._id === project.client);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString();
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': 'bg-green-100 text-green-800',
      'Completed': 'bg-purple-100 text-purple-800',
      'On Hold': 'bg-yellow-100 text-yellow-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handleSave = async () => {
    try {
      await onUpdate(project._id, formData);
      setEditing(false);
    } catch (err) {
      console.error('Failed to update project:', err);
    }
  };

  const handleCancel = () => {
    setFormData(project);
    setEditing(false);
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'tasks', label: 'Tasks', icon: '✅' },
    { id: 'files', label: 'Files', icon: '📎' },
    { id: 'communication', label: 'Communication', icon: '💬' },
    { id: 'financial', label: 'Financial', icon: '💰' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 mb-4 flex items-center"
          >
            ← Back to Projects
          </button>
          <h1 className="text-3xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-gray-600 mt-1">{project.description}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {editing ? 'Cancel Edit' : 'Edit Project'}
          </button>
          <button
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this project?')) {
                onDelete(project._id);
              }
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Status</p>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                {project.status}
              </span>
            </div>
            <div className="text-2xl">📊</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Progress</p>
              <p className="text-2xl font-bold text-blue-600">{project.progress}%</p>
            </div>
            <div className="text-2xl">📈</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Budget</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(project.budget)}</p>
            </div>
            <div className="text-2xl">💰</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Client</p>
              <p className="text-lg font-semibold text-gray-800">{client?.name || 'Unknown'}</p>
            </div>
            <div className="text-2xl">👤</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-sm font-medium text-gray-600">Platform:</span>
                      <span className="ml-2 text-gray-800">{project.platform}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Category:</span>
                      <span className="ml-2 text-gray-800">{project.category || 'Not specified'}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-gray-600">Tags:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {project.tags && project.tags.length > 0 ? (
                          project.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-500">No tags</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Information</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Progress</span>
                        <div className="text-lg font-semibold text-gray-800">{project.progress}%</div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Payment Status</span>
                        <div className="text-lg font-semibold text-gray-800">
                          {project.budget > 0 ? Math.round((project.amountPaid / project.budget) * 100) : 0}% paid
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {project.requirements && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-800">{project.requirements}</p>
                  </div>
                </div>
              )}

              {project.deliverables && project.deliverables.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Deliverables</h3>
                  <div className="space-y-2">
                    {project.deliverables.map((deliverable, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-800">{deliverable}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Timeline</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">Project Started</p>
                        <p className="text-sm text-gray-600">{formatDate(project.startDate)}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div>
                        <p className="font-medium text-gray-800">Deadline</p>
                        <p className="text-sm text-gray-600">{formatDate(project.deadline)}</p>
                      </div>
                    </div>
                    {project.completedDate && (
                      <div className="flex items-center space-x-4">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <div>
                          <p className="font-medium text-gray-800">Completed</p>
                          <p className="text-sm text-gray-600">{formatDate(project.completedDate)}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Milestones</h3>
                  {project.milestones && project.milestones.length > 0 ? (
                    <div className="space-y-3">
                      {project.milestones.map((milestone, index) => (
                        <div key={index} className="border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-gray-800">{milestone.title}</p>
                              <p className="text-sm text-gray-600">{milestone.description}</p>
                              <p className="text-xs text-gray-500">Due: {formatDate(milestone.dueDate)}</p>
                            </div>
                            <div className={`w-4 h-4 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No milestones defined</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Tasks Tab */}
          {activeTab === 'tasks' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Project Tasks</h3>
              {project.tasks && project.tasks.length > 0 ? (
                <div className="space-y-3">
                  {project.tasks.map((task, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full ${
                            task.status === 'completed' ? 'bg-green-500' : 
                            task.status === 'in-progress' ? 'bg-yellow-500' : 'bg-gray-300'
                          }`}></div>
                          <div>
                            <p className="font-medium text-gray-800">{task.title}</p>
                            {task.description && (
                              <p className="text-sm text-gray-600">{task.description}</p>
                            )}
                            {task.dueDate && (
                              <p className="text-xs text-gray-500">Due: {formatDate(task.dueDate)}</p>
                            )}
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          task.status === 'completed' ? 'bg-green-100 text-green-800' :
                          task.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {task.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No tasks defined</p>
              )}
            </div>
          )}

          {/* Files Tab */}
          {activeTab === 'files' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Files & Attachments</h3>
              {project.attachments && project.attachments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {project.attachments.map((file, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">📎</div>
                        <div>
                          <p className="font-medium text-gray-800">{file.name}</p>
                          <p className="text-sm text-gray-600">{file.type}</p>
                          <p className="text-xs text-gray-500">{formatDate(file.uploadedAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No files uploaded</p>
              )}
            </div>
          )}

          {/* Communication Tab */}
          {activeTab === 'communication' && (
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Communication Log</h3>
              {project.communicationLogs && project.communicationLogs.length > 0 ? (
                <div className="space-y-4">
                  {project.communicationLogs.map((log, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {log.type === 'meeting' ? '📅' : 
                             log.type === 'email' ? '📧' : 
                             log.type === 'call' ? '📞' : '📝'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{log.title}</p>
                            {log.content && (
                              <p className="text-sm text-gray-600 mt-1">{log.content}</p>
                            )}
                            <p className="text-xs text-gray-500 mt-1">{formatDate(log.date)}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800`}>
                          {log.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No communication logs</p>
              )}
            </div>
          )}

          {/* Financial Tab */}
          {activeTab === 'financial' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Total Budget</h4>
                  <p className="text-2xl font-bold text-gray-900">{formatCurrency(project.budget)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Amount Paid</h4>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(project.amountPaid)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-800 mb-2">Balance Due</h4>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(project.budget - project.amountPaid)}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-800 mb-4">Payment Status</h4>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800">Payment Status</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      project.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      project.paymentStatus === 'Partially Paid' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {project.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>

              {project.invoices && project.invoices.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-800 mb-4">Linked Invoices</h4>
                  <div className="space-y-2">
                    {project.invoices.map((invoice, index) => (
                      <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-800">Invoice #{invoice._id}</span>
                          <span className="text-gray-600">{formatCurrency(invoice.amount)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;


