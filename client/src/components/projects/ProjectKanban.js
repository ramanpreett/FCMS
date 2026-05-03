import React, { useState } from "react";

const ProjectKanban = ({ projects, clients, onProjectClick, onUpdate }) => {
  const [draggedProject, setDraggedProject] = useState(null);

  const columns = [
    {
      id: 'todo',
      title: 'To Do',
      icon: '📋',
      color: 'bg-gray-100',
      status: 'Active'
    },
    {
      id: 'in-progress',
      title: 'In Progress',
      icon: '🚀',
      color: 'bg-blue-100',
      status: 'Active'
    },
    {
      id: 'review',
      title: 'Review/Waiting',
      icon: '⏳',
      color: 'bg-yellow-100',
      status: 'On Hold'
    },
    {
      id: 'completed',
      title: 'Completed',
      icon: '✅',
      color: 'bg-green-100',
      status: 'Completed'
    }
  ];

  const getProjectsForColumn = (columnId) => {
    switch (columnId) {
      case 'todo':
        return projects.filter(p => p.status === 'Active' && p.progress < 25);
      case 'in-progress':
        return projects.filter(p => p.status === 'Active' && p.progress >= 25 && p.progress < 90);
      case 'review':
        return projects.filter(p => p.status === 'On Hold' || (p.status === 'Active' && p.progress >= 90));
      case 'completed':
        return projects.filter(p => p.status === 'Completed');
      default:
        return [];
    }
  };

  const handleDragStart = (e, project) => {
    setDraggedProject(project);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', e.target.outerHTML);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('ring-2', 'ring-blue-400', 'ring-opacity-50');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50');
  };

  const handleDrop = async (e, columnId) => {
    e.preventDefault();
    e.currentTarget.classList.remove('ring-2', 'ring-blue-400', 'ring-opacity-50');
    
    if (!draggedProject) return;

    let newStatus = draggedProject.status;
    let newProgress = draggedProject.progress;

    switch (columnId) {
      case 'todo':
        newStatus = 'Active';
        newProgress = Math.min(newProgress, 24);
        break;
      case 'in-progress':
        newStatus = 'Active';
        newProgress = Math.max(25, Math.min(newProgress, 89));
        break;
      case 'review':
        newStatus = 'On Hold';
        newProgress = Math.max(90, newProgress);
        break;
      case 'completed':
        newStatus = 'Completed';
        newProgress = 100;
        break;
    }

    try {
      await onUpdate(draggedProject._id, {
        ...draggedProject,
        status: newStatus,
        progress: newProgress
      });
    } catch (err) {
      console.error('Failed to update project:', err);
    }

    setDraggedProject(null);
  };

  const handleDragEnd = () => {
    setDraggedProject(null);
  };

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

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isOverdue = (deadline) => {
    return new Date(deadline) < new Date();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Project Kanban Board</h2>
        <div className="text-sm text-gray-600">
          Drag and drop projects between columns to update their status
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {columns.map((column) => {
          const columnProjects = getProjectsForColumn(column.id);
          
          return (
            <div
              key={column.id}
              className={`${column.color} rounded-lg p-4 min-h-[600px] transition-all duration-200`}
              onDragOver={handleDragOver}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-xl">{column.icon}</span>
                  <h3 className="font-semibold text-gray-800">{column.title}</h3>
                </div>
                <span className="bg-white text-gray-600 text-sm font-medium px-2 py-1 rounded-full">
                  {columnProjects.length}
                </span>
              </div>

              <div className="space-y-3">
                {columnProjects.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <div className="text-2xl mb-2">📭</div>
                    <p className="text-sm">No projects</p>
                  </div>
                ) : (
                  columnProjects.map((project) => {
                    const client = clients.find(c => c._id === project.client);
                    const isProjectOverdue = isOverdue(project.deadline);
                    
                    return (
                      <div
                        key={project._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, project)}
                        onDragEnd={handleDragEnd}
                        onClick={() => onProjectClick(project)}
                        className={`bg-white rounded-lg shadow-sm border border-gray-200 p-4 cursor-pointer hover:shadow-md transition-all duration-200 ${
                          draggedProject && draggedProject._id === project._id ? 'opacity-50 scale-95' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm mb-1 truncate">
                              {project.name}
                            </h4>
                            <p className="text-xs text-gray-600 mb-2">
                              {client?.name || 'Unknown Client'}
                            </p>
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatDate(project.deadline)}
                          </div>
                        </div>

                        <div className="space-y-2">
                          {/* Budget */}
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-medium text-gray-800">
                              {formatCurrency(project.budget)}
                            </span>
                            {isProjectOverdue && (
                              <span className="text-xs text-red-600 font-medium">Overdue</span>
                            )}
                          </div>

                          {/* Tags */}
                          {project.tags && project.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {project.tags.slice(0, 2).map((tag, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs bg-blue-100 text-blue-800"
                                >
                                  {tag}
                                </span>
                              ))}
                              {project.tags.length > 2 && (
                                <span className="text-xs text-gray-500">
                                  +{project.tags.length - 2}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Platform */}
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600">{project.platform}</span>
                            <div className="flex space-x-1">
                              {project.paymentStatus === 'Paid' && (
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                              )}
                              {project.paymentStatus === 'Partially Paid' && (
                                <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>
                              )}
                              {project.paymentStatus === 'Pending' && (
                                <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow p-4">
        <h4 className="font-medium text-gray-800 mb-3">Legend</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-gray-600">Payment Received</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span className="text-gray-600">Partially Paid</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Payment Pending</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-600 rounded-full"></div>
            <span className="text-gray-600">Project Overdue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectKanban;


