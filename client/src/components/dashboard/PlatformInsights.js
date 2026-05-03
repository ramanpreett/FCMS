import React from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const PlatformInsights = ({ clients, revenueByPlatform }) => {
  const getPlatformStats = () => {
    const platformCounts = {};

    clients.forEach(client => {
      const source = client.source || 'Direct';
      platformCounts[source] = (platformCounts[source] || 0) + 1;
    });

    return {
      totalClients: clients.length,
      platformCounts
    };
  };

  const stats = getPlatformStats();

  const getPlatformIcon = (platform) => {
    const icons = {
      'LinkedIn': '🔗',
      'Upwork': '💼',
      'Fiverr': '🎯',
      'Email': '📧',
      'Direct': '👤',
      'Manual': '✏️'
    };
    return icons[platform] || '📊';
  };

  const getPlatformColor = (platform) => {
    const colors = {
      'LinkedIn': 'bg-blue-100 text-blue-800',
      'Upwork': 'bg-green-100 text-green-800',
      'Fiverr': 'bg-purple-100 text-purple-800',
      'Email': 'bg-orange-100 text-orange-800',
      'Direct': 'bg-gray-100 text-gray-800',
      'Manual': 'bg-yellow-100 text-yellow-800'
    };
    return colors[platform] || 'bg-gray-100 text-gray-800';
  };

  const getChartColors = (platform) => {
    const colors = {
      'LinkedIn': '#3B82F6',
      'Upwork': '#10B981',
      'Fiverr': '#8B5CF6',
      'Email': '#F59E0B',
      'Direct': '#6B7280',
      'Manual': '#EF4444'
    };
    return colors[platform] || '#9CA3AF';
  };

  // Prepare data for Client Distribution Chart
  const getClientDistributionData = () => {
    const platforms = Object.keys(stats.platformCounts);
    const counts = Object.values(stats.platformCounts);
    const colors = platforms.map(platform => getChartColors(platform));

    return {
      labels: platforms,
      datasets: [
        {
          data: counts,
          backgroundColor: colors,
          borderColor: colors.map(color => color + '80'),
          borderWidth: 2,
        },
      ],
    };
  };

  // Prepare data for Revenue Chart
  const getRevenueData = () => {
    const platforms = revenueByPlatform.map(item => item.platform);
    const revenues = revenueByPlatform.map(item => item.revenue);
    const colors = platforms.map(platform => getChartColors(platform));

    return {
      labels: platforms,
      datasets: [
        {
          label: 'Revenue ($)',
          data: revenues,
          backgroundColor: colors.map(color => color + '80'),
          borderColor: colors,
          borderWidth: 2,
        },
      ],
    };
  };

  const clientDistributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
        },
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} clients (${percentage}%)`;
          }
        }
      }
    },
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            return `${context.label}: $${context.parsed.y.toLocaleString()}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return '$' + value.toLocaleString();
          }
        }
      }
    },
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Platform Insights</h3>
        <div className="text-sm text-gray-500">
          {stats.totalClients} total clients
        </div>
      </div>
      

      
      {/* Platform Distribution */}
      <div className="mb-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">Client Distribution by Platform</h4>
        {Object.entries(stats.platformCounts).length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No platform data available
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-64">
                <Doughnut data={getClientDistributionData()} options={clientDistributionOptions} />
              </div>
            </div>
            
            {/* List View */}
            <div className="space-y-3">
              {Object.entries(stats.platformCounts)
                .sort(([,a], [,b]) => b - a)
                .map(([platform, count]) => {
                  const percentage = stats.totalClients > 0 
                    ? (count / stats.totalClients * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getPlatformIcon(platform)}</span>
                        <div>
                          <div className="font-medium text-gray-800">{platform}</div>
                          <div className="text-sm text-gray-500">{count} clients</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      
      {/* Revenue by Platform */}
      <div>
        <h4 className="text-md font-semibold text-gray-800 mb-4">Revenue by Platform</h4>
        {revenueByPlatform.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No revenue data available
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-64">
                <Bar data={getRevenueData()} options={revenueOptions} />
              </div>
            </div>
            
            {/* List View */}
            <div className="space-y-3">
              {revenueByPlatform
                .sort((a, b) => b.revenue - a.revenue)
                .map((platform) => {
                  const totalRevenue = revenueByPlatform.reduce((sum, p) => sum + p.revenue, 0);
                  const percentage = totalRevenue > 0 
                    ? (platform.revenue / totalRevenue * 100).toFixed(1)
                    : 0;
                  
                  return (
                    <div key={platform.platform} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="text-lg">{getPlatformIcon(platform.platform)}</span>
                        <div>
                          <div className="font-medium text-gray-800">{platform.platform}</div>
                          <div className="text-sm text-green-600 font-semibold">
                            ${platform.revenue.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex-1 bg-gray-200 rounded-full h-2 w-20">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-gray-600">{percentage}%</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>
      
      {/* Insights Summary */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-md font-semibold text-gray-800 mb-3">Key Insights</h4>
        <div className="space-y-2 text-sm text-gray-600">
          {stats.totalClients > 0 && (
            <>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                <span>
                  {Object.keys(stats.platformCounts).length} different platforms are bringing in clients
                </span>
              </div>
              {revenueByPlatform.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                  <span>
                    Top platform: {revenueByPlatform[0]?.platform} (${revenueByPlatform[0]?.revenue.toLocaleString()})
                  </span>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlatformInsights;


