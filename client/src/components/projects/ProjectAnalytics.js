import React from "react";

const ProjectAnalytics = ({ projects, clients, stats }) => {
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

  const getAnalytics = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === 'Active').length;
    const completedProjects = projects.filter(p => p.status === 'Completed').length;
    const overdueProjects = projects.filter(p => {
      if (p.status === 'Completed') return false;
      return new Date(p.deadline) < new Date();
    }).length;

    // Revenue Analysis
    const totalRevenue = projects
      .filter(p => p.paymentStatus === 'Paid')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    const pendingRevenue = projects
      .filter(p => p.paymentStatus === 'Pending')
      .reduce((sum, p) => sum + (p.budget || 0), 0);

    // Platform Analysis
    const platformStats = {};
    projects.forEach(project => {
      const platform = project.platform || 'Direct';
      if (!platformStats[platform]) {
        platformStats[platform] = { count: 0, revenue: 0 };
      }
      platformStats[platform].count++;
      if (project.paymentStatus === 'Paid') {
        platformStats[platform].revenue += project.budget || 0;
      }
    });

    // Client Analysis
    const clientStats = {};
    projects.forEach(project => {
      const client = clients.find(c => c._id === project.client);
      const clientName = client?.name || 'Unknown';
      if (!clientStats[clientName]) {
        clientStats[clientName] = { count: 0, revenue: 0 };
      }
      clientStats[clientName].count++;
      if (project.paymentStatus === 'Paid') {
        clientStats[clientName].revenue += project.budget || 0;
      }
    });

    // Average Project Duration
    const completedProjectsWithDates = projects.filter(p => 
      p.status === 'Completed' && p.startDate && p.completedDate
    );
    const avgDuration = completedProjectsWithDates.length > 0 
      ? completedProjectsWithDates.reduce((sum, p) => {
          const duration = new Date(p.completedDate) - new Date(p.startDate);
          return sum + duration;
        }, 0) / completedProjectsWithDates.length / (1000 * 60 * 60 * 24)
      : 0;

    // Monthly Revenue
    const monthlyRevenue = {};
    projects.forEach(project => {
      if (project.paymentStatus === 'Paid' && project.completedDate) {
        const month = new Date(project.completedDate).toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'short' 
        });
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (project.budget || 0);
      }
    });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      overdueProjects,
      totalRevenue,
      pendingRevenue,
      platformStats,
      clientStats,
      avgDuration: Math.round(avgDuration),
      monthlyRevenue
    };
  };

  const analytics = getAnalytics();

  const getTopClients = () => {
    return Object.entries(analytics.clientStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  const getTopPlatforms = () => {
    return Object.entries(analytics.platformStats)
      .sort(([,a], [,b]) => b.revenue - a.revenue)
      .slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Project Analytics</h2>
        <div className="text-sm text-gray-600">
          Last updated: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Projects</p>
              <p className="text-3xl font-bold text-blue-600">{analytics.totalProjects}</p>
            </div>
            <div className="text-3xl text-blue-600">📊</div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="text-green-600 font-medium">{analytics.activeProjects}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completed</span>
              <span className="text-purple-600 font-medium">{analytics.completedProjects}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
            <div className="text-3xl text-green-600">💰</div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="text-orange-600 font-medium">{formatCurrency(analytics.pendingRevenue)}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Duration</p>
              <p className="text-3xl font-bold text-purple-600">{analytics.avgDuration} days</p>
            </div>
            <div className="text-3xl text-purple-600">⏱️</div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Overdue</span>
              <span className="text-red-600 font-medium">{analytics.overdueProjects}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-3xl font-bold text-indigo-600">
                {analytics.totalProjects > 0 
                  ? Math.round((analytics.completedProjects / analytics.totalProjects) * 100)
                  : 0}%
              </p>
            </div>
            <div className="text-3xl text-indigo-600">📈</div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-indigo-500 h-2 rounded-full"
                style={{ 
                  width: `${analytics.totalProjects > 0 
                    ? (analytics.completedProjects / analytics.totalProjects) * 100 
                    : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients by Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Top Clients by Revenue</h3>
          {getTopClients().length > 0 ? (
            <div className="space-y-4">
              {getTopClients().map(([clientName, data], index) => (
                <div key={clientName} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{clientName}</p>
                      <p className="text-sm text-gray-600">{data.count} projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(data.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      {analytics.totalRevenue > 0 
                        ? Math.round((data.revenue / analytics.totalRevenue) * 100)
                        : 0}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No client data available</p>
          )}
        </div>

        {/* Platform Performance */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Platform Performance</h3>
          {getTopPlatforms().length > 0 ? (
            <div className="space-y-4">
              {getTopPlatforms().map(([platform, data], index) => (
                <div key={platform} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-sm">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{platform}</p>
                      <p className="text-sm text-gray-600">{data.count} projects</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">{formatCurrency(data.revenue)}</p>
                    <p className="text-xs text-gray-500">
                      {analytics.totalRevenue > 0 
                        ? Math.round((data.revenue / analytics.totalRevenue) * 100)
                        : 0}% of total
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No platform data available</p>
          )}
        </div>
      </div>

      {/* Monthly Revenue Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Revenue Trend</h3>
        {Object.keys(analytics.monthlyRevenue).length > 0 ? (
          <div className="space-y-3">
            {Object.entries(analytics.monthlyRevenue)
              .sort(([a], [b]) => new Date(a) - new Date(b))
              .map(([month, revenue]) => (
                <div key={month} className="flex items-center justify-between">
                  <span className="text-gray-800 font-medium">{month}</span>
                  <div className="flex items-center space-x-3">
                    <div className="w-32 bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-green-500 h-3 rounded-full"
                        style={{ 
                          width: `${Math.max(analytics.totalRevenue) > 0 
                            ? (revenue / Math.max(...Object.values(analytics.monthlyRevenue))) * 100 
                            : 0}%` 
                        }}
                      ></div>
                    </div>
                    <span className="text-green-600 font-semibold">{formatCurrency(revenue)}</span>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No revenue data available</p>
        )}
      </div>

      {/* AI Insights */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">🤖 AI Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analytics.overdueProjects > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-red-600">⚠️</span>
                <span className="font-medium text-red-800">Overdue Projects</span>
              </div>
              <p className="text-sm text-red-700">
                You have {analytics.overdueProjects} overdue project{analytics.overdueProjects > 1 ? 's' : ''}. 
                Consider reaching out to clients for updates.
              </p>
            </div>
          )}

          {analytics.pendingRevenue > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-orange-600">💰</span>
                <span className="font-medium text-orange-800">Pending Revenue</span>
              </div>
              <p className="text-sm text-orange-700">
                You have {formatCurrency(analytics.pendingRevenue)} in pending payments. 
                Follow up on outstanding invoices.
              </p>
            </div>
          )}

          {analytics.avgDuration > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-blue-600">📊</span>
                <span className="font-medium text-blue-800">Performance Insight</span>
              </div>
              <p className="text-sm text-blue-700">
                Average project duration is {analytics.avgDuration} days. 
                {analytics.avgDuration > 30 ? ' Consider optimizing your workflow.' : ' Great project management!'}
              </p>
            </div>
          )}

          {getTopPlatforms().length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-green-600">🎯</span>
                <span className="font-medium text-green-800">Top Platform</span>
              </div>
              <p className="text-sm text-green-700">
                {getTopPlatforms()[0][0]} is your best performing platform with {formatCurrency(getTopPlatforms()[0][1].revenue)} revenue. 
                Consider focusing more efforts there.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="bg-blue-600 text-white p-4 rounded-lg hover:bg-blue-700 transition-colors">
            <div className="text-2xl mb-2">📤</div>
            <div className="font-medium">Export Report</div>
            <div className="text-sm opacity-90">Generate PDF/CSV</div>
          </button>
          <button className="bg-green-600 text-white p-4 rounded-lg hover:bg-green-700 transition-colors">
            <div className="text-2xl mb-2">💰</div>
            <div className="font-medium">Create Invoice</div>
            <div className="text-sm opacity-90">For pending projects</div>
          </button>
          <button className="bg-purple-600 text-white p-4 rounded-lg hover:bg-purple-700 transition-colors">
            <div className="text-2xl mb-2">📅</div>
            <div className="font-medium">Schedule Meeting</div>
            <div className="text-sm opacity-90">With top clients</div>
          </button>
          <button className="bg-orange-600 text-white p-4 rounded-lg hover:bg-orange-700 transition-colors">
            <div className="text-2xl mb-2">📊</div>
            <div className="font-medium">Detailed Analytics</div>
            <div className="text-sm opacity-90">Advanced reports</div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectAnalytics;


