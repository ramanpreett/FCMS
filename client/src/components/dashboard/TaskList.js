import React, { useState } from "react";

const TaskList = ({ tasks, onTaskUpdate, onPageChange }) => {
  const [completedTasks, setCompletedTasks] = useState(new Set());

  const getPriorityColor = (priority) => {
    const colors = {
      high: "bg-red-100 text-red-800 border-red-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-green-100 text-green-800 border-green-200"
    };
    return colors[priority] || colors.low;
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      high: "🔴",
      medium: "🟡",
      low: "🟢"
    };
    return icons[priority] || icons.low;
  };

  const formatDueDate = (date) => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffMs = dueDate - now;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

    if (diffMs < 0) {
      return `Overdue by ${Math.abs(diffDays)} days`;
    } else if (diffDays === 0) {
      return `Due today in ${diffHours} hours`;
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `Due in ${diffDays} days`;
    }
  };

  const handleComplete = (taskId) => {
    setCompletedTasks(prev => new Set([...prev, taskId]));
    // In a real app, you'd update the task status in the backend
    setTimeout(() => {
      if (onTaskUpdate) onTaskUpdate();
    }, 1000);
  };

  const handleSnooze = (taskId) => {
    // In a real app, you'd update the task due date in the backend
    console.log(`Snoozing task: ${taskId}`);
  };

  const handleGoToTask = (task) => {
    // Navigate to the appropriate page based on task type
    switch (task.type) {
      case 'invoice':
        onPageChange('invoices');
        break;
      case 'meeting':
        onPageChange('meetings');
        break;
      case 'project':
        onPageChange('projects');
        break;
      default:
        onPageChange('dashboard');
    }
  };

  const filteredTasks = tasks.filter(task => !completedTasks.has(task.id));

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Tasks & Follow-ups</h3>
        <span className="text-sm text-gray-500">{filteredTasks.length} tasks</span>
      </div>
      
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending tasks</p>
            <p className="text-sm">You're all caught up!</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                    <span className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(task.priority)}`}>
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDueDate(task.dueDate)}
                    </span>
                  </div>
                  
                  <h4 className="font-medium text-gray-900 mb-1">
                    {task.title}
                  </h4>
                  
                  <p className="text-sm text-gray-600 mb-3">
                    {task.description}
                  </p>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleComplete(task.id)}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 transition-colors"
                    >
                      Mark Done
                    </button>
                    <button
                      onClick={() => handleSnooze(task.id)}
                      className="text-xs bg-gray-500 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors"
                    >
                      Snooze
                    </button>
                    <button 
                      onClick={() => handleGoToTask(task)}
                      className="text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 transition-colors"
                    >
                      Go to Task
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {filteredTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
            View all tasks →
          </button>
        </div>
      )}
    </div>
  );
};

export default TaskList;


