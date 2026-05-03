import React from 'react';


const QuickStats = ({ stats, previousStats }) => {
  const calculateTrend = (current, previous) => {
    if (!previous || previous === 0) return { value: 0, direction: 'neutral' };
    const change = ((current - previous) / previous) * 100;
    return {
      value: Math.abs(change).toFixed(1),
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
    };
  };

  const getTrendIcon = (direction) => {
    switch (direction) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  const getTrendColor = (direction) => {
    switch (direction) {
      case 'up': return 'text-green-500';
      case 'down': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  const statCards = [
    {
      title: 'Total Clients',
      value: stats.totalClients,
      icon: '👥',
      color: 'bg-blue-500',
      textColor: 'text-blue-600',
      trend: calculateTrend(stats.totalClients, previousStats?.totalClients)
    },
    {
      title: 'Active Projects',
      value: stats.activeProjects,
      icon: '🚀',
      color: 'bg-green-500',
      textColor: 'text-green-600',
      trend: calculateTrend(stats.activeProjects, previousStats?.activeProjects)
    },
    {
      title: 'Pending Invoices',
      value: stats.pendingInvoices,
      icon: '📄',
      color: 'bg-orange-500',
      textColor: 'text-orange-600',
      trend: calculateTrend(stats.pendingInvoices, previousStats?.pendingInvoices)
    },
    {
      title: 'Upcoming Meetings',
      value: stats.upcomingMeetings,
      icon: '📅',
      color: 'bg-purple-500',
      textColor: 'text-purple-600',
      trend: calculateTrend(stats.upcomingMeetings, previousStats?.upcomingMeetings)
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {statCards.map((stat, index) => (
        <div
          key={index}
          className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {stat.title}
              </p>
              <p className={`text-3xl font-bold ${stat.textColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-full ${stat.color} flex items-center justify-center`}>
              <span className="text-2xl">{stat.icon}</span>
            </div>
          </div>
          
          {/* Trend indicator */}
          {stat.trend.value > 0 && (
            <div className="mt-4 flex items-center text-sm">
              <span className={`mr-1 ${getTrendColor(stat.trend.direction)}`}>
                {getTrendIcon(stat.trend.direction)}
              </span>
              <span className="text-gray-500">
                {stat.trend.direction === 'up' ? '+' : stat.trend.direction === 'down' ? '-' : ''}{stat.trend.value}% from last month
              </span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default QuickStats;

