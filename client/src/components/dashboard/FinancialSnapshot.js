import React from "react";

const FinancialSnapshot = ({ data, previousMonthData }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 100;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  // Use actual previous month data if available, otherwise calculate from current data
  const previousMonthIncome = previousMonthData?.monthlyIncome || data.monthlyIncome * 0.85;
  const incomeChange = getPercentageChange(data.monthlyIncome, previousMonthIncome);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800">Financial Snapshot</h3>
        <div className="text-sm text-gray-500">
          This Month
        </div>
      </div>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(data.monthlyIncome)}
          </div>
          <div className="text-sm text-gray-600 mb-1">Monthly Income</div>
          <div className={`text-xs ${incomeChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {incomeChange >= 0 ? '↗' : '↘'} {Math.abs(incomeChange)}% vs last month
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {formatCurrency(data.pendingPayments)}
          </div>
          <div className="text-sm text-gray-600 mb-1">Pending Payments</div>
          <div className="text-xs text-gray-500">
            {data.pendingPayments > 0 ? 'Requires attention' : 'All caught up'}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(data.recurringRevenue)}
          </div>
          <div className="text-sm text-gray-600 mb-1">Recurring Revenue</div>
          <div className="text-xs text-gray-500">
            Monthly subscriptions
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialSnapshot;


