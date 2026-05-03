import React from 'react';

const RecentActivity = ({ activities, onPageChange }) => {

  const getActivityIcon = (type) => {
    switch (type) {
      case 'client':
        return '👤';
      case 'invoice':
        return '💰';
      case 'meeting':
        return '📅';
      case 'project':
        return '🚀';
      default:
        return '📝';
    }
  };

  const getActivityColor = (color) => {
    const colorMap = {
      blue: 'bg-blue-100 text-blue-800',
      green: 'bg-green-100 text-green-800',
      orange: 'bg-orange-100 text-orange-800',
      purple: 'bg-purple-100 text-purple-800',
      red: 'bg-red-100 text-red-800'
    };
    return colorMap[color] || 'bg-gray-100 text-gray-800';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const activityDate = new Date(date);
    const diffInMinutes = Math.floor((now - activityDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    
    return activityDate.toLocaleDateString();
  };

  if (!activities || activities.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
          <span className="text-sm text-gray-500">View all</span>
        </div>
        <div className="text-center py-8">
          <div className="text-4xl mb-2">📝</div>
          <p className="text-gray-500">No recent activity</p>
          <p className="text-sm text-gray-400">Activities will appear here as you use the app</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        <span className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
          View all
        </span>
      </div>
      
      <div className="space-y-4">
        {activities.map((activity) => (
          <div 
            key={activity.id} 
            className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-150"
          >
            <div className="flex-shrink-0">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${getActivityColor(activity.color)}`}>
                {activity.icon || getActivityIcon(activity.type)}
              </div>
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {activity.title}
                </p>
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatTimeAgo(activity.date)}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {activity.description}
              </p>
            </div>
          </div>
        ))}
      </div>
      
      {activities.length >= 10 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button 
            onClick={() => onPageChange('analytics')}
            className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Load more activities
          </button>
        </div>
      )}
    </div>
  );
};

export default RecentActivity;

