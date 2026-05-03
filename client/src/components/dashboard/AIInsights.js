import React from "react";

const AIInsights = ({ clients, invoices, tasks }) => {
  const generateInsights = () => {
    const insights = [];
    
    // Invoice insights
    const overdueInvoices = invoices.filter(invoice => {
      if (invoice.status === 'Paid') return false;
      const dueDate = new Date(invoice.dueDate);
      return dueDate < new Date();
    });
    
    if (overdueInvoices.length > 0) {
      insights.push({
        type: 'alert',
        icon: '🚨',
        title: 'Overdue Invoices',
        message: `You have ${overdueInvoices.length} overdue invoice${overdueInvoices.length > 1 ? 's' : ''} totaling $${overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}.`,
        action: 'Review Overdue',
        priority: 'high'
      });
    }
    
    // Revenue insights
    const thisMonthInvoices = invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt || Date.now());
      const thisMonth = new Date();
      return invoiceDate.getMonth() === thisMonth.getMonth() && 
             invoiceDate.getFullYear() === thisMonth.getFullYear();
    });
    
    const paidThisMonth = thisMonthInvoices.filter(inv => inv.status === 'Paid');
    const totalThisMonth = paidThisMonth.reduce((sum, inv) => sum + inv.amount, 0);
    
    if (totalThisMonth > 0) {
      insights.push({
        type: 'success',
        icon: '💰',
        title: 'Monthly Revenue',
        message: `You've earned $${totalThisMonth.toLocaleString()} this month from ${paidThisMonth.length} paid invoice${paidThisMonth.length > 1 ? 's' : ''}.`,
        action: 'View Details',
        priority: 'medium'
      });
    }
    
    // Task insights
    const highPriorityTasks = tasks.filter(task => task.priority === 'high');
    if (highPriorityTasks.length > 0) {
      insights.push({
        type: 'info',
        icon: '📋',
        title: 'High Priority Tasks',
        message: `You have ${highPriorityTasks.length} high-priority task${highPriorityTasks.length > 1 ? 's' : ''} that need attention.`,
        action: 'View Tasks',
        priority: 'high'
      });
    }
    
    // Client source insights
    const sourceCounts = {};
    clients.forEach(client => {
      const source = client.source || 'Direct';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    const topSource = Object.entries(sourceCounts).sort(([,a], [,b]) => b - a)[0];
    if (topSource && topSource[1] > 1) {
      insights.push({
        type: 'info',
        icon: '📊',
        title: 'Top Client Source',
        message: `${topSource[0]} is your best performing platform with ${topSource[1]} client${topSource[1] > 1 ? 's' : ''}. Consider focusing more efforts there.`,
        action: 'View Analytics',
        priority: 'low'
      });
    }
    
    // Growth insights
    if (clients.length > 0) {
      const recentClients = clients.filter(client => {
        const clientDate = new Date(client.createdAt || Date.now());
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        return clientDate > thirtyDaysAgo;
      });
      
      if (recentClients.length > 0) {
        insights.push({
          type: 'success',
          icon: '📈',
          title: 'Client Growth',
          message: `You've added ${recentClients.length} new client${recentClients.length > 1 ? 's' : ''} in the last 30 days. Great momentum!`,
          action: 'View Growth',
          priority: 'medium'
        });
      }
    }
    
    return insights.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  const insights = generateInsights();

  const getInsightColor = (type) => {
    const colors = {
      success: 'bg-green-50 border-green-200 text-green-800',
      warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      alert: 'bg-red-50 border-red-200 text-red-800',
      info: 'bg-blue-50 border-blue-200 text-blue-800'
    };
    return colors[type] || colors.info;
  };

  const getInsightIconColor = (type) => {
    const colors = {
      success: 'text-green-600',
      warning: 'text-yellow-600',
      alert: 'text-red-600',
      info: 'text-blue-600'
    };
    return colors[type] || colors.info;
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">AI Insights</h3>
        <span className="text-sm text-gray-500">Smart suggestions</span>
      </div>
      
      <div className="space-y-4">
        {insights.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <div className="text-4xl mb-2">🤖</div>
            <p>No insights available</p>
            <p className="text-sm">AI insights will appear as you use the system</p>
          </div>
        ) : (
          insights.slice(0, 5).map((insight, index) => (
            <div
              key={index}
              className={`border rounded-lg p-4 ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start space-x-3">
                <div className={`text-2xl ${getInsightIconColor(insight.type)}`}>
                  {insight.icon}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium">{insight.title}</h4>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      insight.priority === 'high' ? 'bg-red-100 text-red-700' :
                      insight.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {insight.priority}
                    </span>
                  </div>
                  
                  <p className="text-sm mb-3">
                    {insight.message}
                  </p>
                  
                  <button className="text-sm font-medium underline hover:no-underline">
                    {insight.action} →
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* AI Suggestions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-3">💡 Pro Tips</h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Set up recurring invoices for regular clients to save time</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Use the automation features to capture clients from multiple platforms</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Schedule follow-up reminders for overdue invoices</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="text-blue-500">•</span>
            <span>Export your data regularly for backup and analysis</span>
          </div>
        </div>
      </div>
      
      {/* Performance Summary */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-600">Insights generated:</span>
          <span className="font-medium text-gray-800">{insights.length}</span>
        </div>
        <div className="flex justify-between items-center text-sm mt-1">
          <span className="text-gray-600">Last updated:</span>
          <span className="text-gray-800">{new Date().toLocaleTimeString()}</span>
        </div>
      </div>
    </div>
  );
};

export default AIInsights;


