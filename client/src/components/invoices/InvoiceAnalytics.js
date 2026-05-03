import React, { useState, useEffect } from "react";

const InvoiceAnalytics = ({ invoices = [], onBack }) => {
  const [timeframe, setTimeframe] = useState('6months');
  const [analytics, setAnalytics] = useState({
    totalRevenue: 0,
    paidRevenue: 0,
    outstandingAmount: 0,
    overdueAmount: 0,
    totalInvoices: 0,
    paidInvoices: 0,
    overdueInvoices: 0,
    averageInvoiceValue: 0,
    monthlyData: [],
    statusDistribution: {},
    clientBreakdown: [],
    recentTrends: {}
  });

  useEffect(() => {
    calculateAnalytics();
  }, [invoices, timeframe]);

  const calculateAnalytics = () => {
    if (!invoices || invoices.length === 0) {
      setAnalytics({
        totalRevenue: 0,
        paidRevenue: 0,
        outstandingAmount: 0,
        overdueAmount: 0,
        totalInvoices: 0,
        paidInvoices: 0,
        overdueInvoices: 0,
        averageInvoiceValue: 0,
        monthlyData: [],
        statusDistribution: {},
        clientBreakdown: [],
        recentTrends: {}
      });
      return;
    }

    // Filter invoices based on timeframe
    const cutoffDate = new Date();
    switch (timeframe) {
      case '1month':
        cutoffDate.setMonth(cutoffDate.getMonth() - 1);
        break;
      case '3months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 3);
        break;
      case '6months':
        cutoffDate.setMonth(cutoffDate.getMonth() - 6);
        break;
      case '1year':
        cutoffDate.setFullYear(cutoffDate.getFullYear() - 1);
        break;
      case 'all':
      default:
        cutoffDate.setFullYear(1970);
        break;
    }

    const filteredInvoices = invoices.filter(invoice => 
      new Date(invoice.issueDate) >= cutoffDate
    );

    // Basic calculations
    const totalRevenue = filteredInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const paidInvoices = filteredInvoices.filter(invoice => invoice.status === 'paid');
    const paidRevenue = paidInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    const outstandingInvoices = filteredInvoices.filter(invoice => 
      invoice.status === 'sent' || invoice.status === 'overdue'
    );
    const outstandingAmount = outstandingInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    const overdueInvoices = filteredInvoices.filter(invoice => 
      invoice.status === 'sent' && new Date(invoice.dueDate) < new Date()
    );
    const overdueAmount = overdueInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);

    const averageInvoiceValue = filteredInvoices.length > 0 ? totalRevenue / filteredInvoices.length : 0;

    // Status distribution
    const statusDistribution = filteredInvoices.reduce((acc, invoice) => {
      acc[invoice.status] = (acc[invoice.status] || 0) + 1;
      return acc;
    }, {});

    // Monthly data for charts
    const monthlyData = generateMonthlyData(filteredInvoices);

    // Client breakdown
    const clientBreakdown = generateClientBreakdown(filteredInvoices);

    // Recent trends
    const recentTrends = calculateRecentTrends(filteredInvoices);

    setAnalytics({
      totalRevenue,
      paidRevenue,
      outstandingAmount,
      overdueAmount,
      totalInvoices: filteredInvoices.length,
      paidInvoices: paidInvoices.length,
      overdueInvoices: overdueInvoices.length,
      averageInvoiceValue,
      monthlyData,
      statusDistribution,
      clientBreakdown,
      recentTrends
    });
  };

  const generateMonthlyData = (invoices) => {
    const monthlyMap = {};
    
    invoices.forEach(invoice => {
      const monthKey = new Date(invoice.issueDate).toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short' 
      });
      
      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { 
          month: monthKey, 
          revenue: 0, 
          count: 0, 
          paid: 0, 
          outstanding: 0 
        };
      }
      
      monthlyMap[monthKey].revenue += invoice.total || 0;
      monthlyMap[monthKey].count += 1;
      
      if (invoice.status === 'paid') {
        monthlyMap[monthKey].paid += invoice.total || 0;
      } else if (invoice.status === 'sent' || invoice.status === 'overdue') {
        monthlyMap[monthKey].outstanding += invoice.total || 0;
      }
    });

    return Object.values(monthlyMap).sort((a, b) => 
      new Date(a.month + ' 1, 2023') - new Date(b.month + ' 1, 2023')
    );
  };

  const generateClientBreakdown = (invoices) => {
    const clientMap = {};
    
    invoices.forEach(invoice => {
      const clientName = invoice.client?.name || 'Unknown Client';
      
      if (!clientMap[clientName]) {
        clientMap[clientName] = { 
          name: clientName, 
          revenue: 0, 
          count: 0, 
          paid: 0, 
          outstanding: 0 
        };
      }
      
      clientMap[clientName].revenue += invoice.total || 0;
      clientMap[clientName].count += 1;
      
      if (invoice.status === 'paid') {
        clientMap[clientName].paid += invoice.total || 0;
      } else if (invoice.status === 'sent' || invoice.status === 'overdue') {
        clientMap[clientName].outstanding += invoice.total || 0;
      }
    });

    return Object.values(clientMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 clients
  };

  const calculateRecentTrends = (invoices) => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    
    const lastMonth = new Date(thisMonth);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const thisMonthInvoices = invoices.filter(invoice => 
      new Date(invoice.issueDate) >= thisMonth
    );
    
    const lastMonthInvoices = invoices.filter(invoice => 
      new Date(invoice.issueDate) >= lastMonth && new Date(invoice.issueDate) < thisMonth
    );

    const thisMonthRevenue = thisMonthInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    const lastMonthRevenue = lastMonthInvoices.reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    
    const revenueGrowth = lastMonthRevenue > 0 ? 
      ((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 : 0;
    
    const invoiceGrowth = lastMonthInvoices.length > 0 ? 
      ((thisMonthInvoices.length - lastMonthInvoices.length) / lastMonthInvoices.length) * 100 : 0;

    return {
      revenueGrowth,
      invoiceGrowth,
      thisMonthRevenue,
      lastMonthRevenue,
      thisMonthCount: thisMonthInvoices.length,
      lastMonthCount: lastMonthInvoices.length
    };
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const getStatusColor = (status) => {
    const colors = {
      draft: 'bg-gray-500',
      sent: 'bg-blue-500',
      paid: 'bg-green-500',
      overdue: 'bg-red-500',
      cancelled: 'bg-red-400'
    };
    return colors[status] || 'bg-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header with Timeframe Filter */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="text-gray-600 hover:text-gray-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
              Back to List
            </button>
          )}
          <h2 className="text-2xl font-bold text-gray-900">Invoice Analytics</h2>
        </div>
        
        <select
          value={timeframe}
          onChange={(e) => setTimeframe(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="1month">Last Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="1year">Last Year</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
              {analytics.recentTrends.revenueGrowth !== undefined && (
                <p className={`text-sm ${analytics.recentTrends.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatPercentage(analytics.recentTrends.revenueGrowth)} from last month
                </p>
              )}
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Paid Revenue</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(analytics.paidRevenue)}</p>
              <p className="text-sm text-gray-500">
                {analytics.totalRevenue > 0 ? 
                  `${((analytics.paidRevenue / analytics.totalRevenue) * 100).toFixed(1)}% of total` : 
                  '0% of total'
                }
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding</p>
              <p className="text-2xl font-bold text-orange-600">{formatCurrency(analytics.outstandingAmount)}</p>
              <p className="text-sm text-gray-500">{analytics.totalInvoices - analytics.paidInvoices} invoices</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(analytics.overdueAmount)}</p>
              <p className="text-sm text-gray-500">{analytics.overdueInvoices} invoices</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.892-.833-2.664 0L4.15 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Revenue Chart */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue Trend</h3>
          
          {analytics.monthlyData.length > 0 ? (
            <div className="space-y-3">
              {analytics.monthlyData.slice(-6).map((month, index) => {
                const maxRevenue = Math.max(...analytics.monthlyData.map(m => m.revenue));
                const widthPercentage = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="w-16 text-sm text-gray-600">{month.month}</div>
                    <div className="flex-1 mx-4">
                      <div className="bg-gray-200 rounded-full h-6 relative">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-600 h-6 rounded-full flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(widthPercentage, 5)}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {formatCurrency(month.revenue)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="w-12 text-sm text-gray-600 text-right">{month.count}</div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>

        {/* Status Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Status Distribution</h3>
          
          {Object.keys(analytics.statusDistribution).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(analytics.statusDistribution).map(([status, count]) => {
                const percentage = analytics.totalInvoices > 0 ? 
                  (count / analytics.totalInvoices) * 100 : 0;
                
                return (
                  <div key={status} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(status)}`}></div>
                      <span className="text-sm font-medium text-gray-700 capitalize">{status}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getStatusColor(status)}`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No data available</p>
          )}
        </div>
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Clients */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Clients by Revenue</h3>
          
          {analytics.clientBreakdown.length > 0 ? (
            <div className="space-y-4">
              {analytics.clientBreakdown.slice(0, 5).map((client, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-600">{client.count} invoices</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                    <p className="text-sm text-green-600">{formatCurrency(client.paid)} paid</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No client data available</p>
          )}
        </div>

        {/* Key Statistics */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Statistics</h3>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Average Invoice Value</span>
              <span className="font-semibold text-gray-900">{formatCurrency(analytics.averageInvoiceValue)}</span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Payment Success Rate</span>
              <span className="font-semibold text-gray-900">
                {analytics.totalInvoices > 0 ? 
                  `${((analytics.paidInvoices / analytics.totalInvoices) * 100).toFixed(1)}%` : 
                  '0%'
                }
              </span>
            </div>
            
            <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-600">Total Invoices</span>
              <span className="font-semibold text-gray-900">{analytics.totalInvoices}</span>
            </div>
            
            {analytics.recentTrends.thisMonthCount !== undefined && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-blue-700">This Month's Invoices</span>
                <div className="text-right">
                  <span className="font-semibold text-blue-900">{analytics.recentTrends.thisMonthCount}</span>
                  {analytics.recentTrends.invoiceGrowth !== 0 && (
                    <p className={`text-sm ${analytics.recentTrends.invoiceGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatPercentage(analytics.recentTrends.invoiceGrowth)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceAnalytics;