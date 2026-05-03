import React from "react";

const Sidebar = ({ activePage, onPageChange }) => {
  const navigationItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview & Analytics'
    },
    {
      id: 'clients',
      label: 'Clients',
      icon: '👥',
      description: 'Client Management'
    },
    {
      id: 'projects',
      label: 'Projects',
      icon: '🚀',
      description: 'Project Tracking'
    },
    {
      id: 'invoices',
      label: 'Invoices',
      icon: '📄',
      description: 'Billing & Payments'
    },
    {
      id: 'meetings',
      label: 'Calendar',
      icon: '📅',
      description: 'Meetings & Events'
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: '📈',
      description: 'Reports & Insights'
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: '⚙️',
      description: 'Account & Preferences'
    }
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <div className="p-6">
        {/* Logo */}
        <div className="flex items-center space-x-3 mb-8">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">C</span>
          </div>
          <div>
            <div className="font-bold text-gray-800">ClientPlus</div>
            <div className="text-xs text-gray-500">Pro</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-2">
          {navigationItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                activePage === item.id
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <div className="flex-1">
                <div className="font-medium">{item.label}</div>
                <div className="text-xs text-gray-500">{item.description}</div>
              </div>
              {activePage === item.id && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          ))}
        </nav>

        {/* Quick Stats */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-800 mb-3">Quick Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Pending Invoices</span>
              <span className="font-semibold text-orange-600">5</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold text-blue-600">$8,450</span>
            </div>
          </div>
        </div>

        {/* Help & Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-blue-600">💬</span>
              <span className="text-sm font-medium text-blue-800">Need Help?</span>
            </div>
            <p className="text-xs text-blue-700 mb-3">
              Get support or explore our documentation
            </p>
            <div className="space-y-2">
              <button className="w-full text-xs bg-blue-600 text-white py-2 px-3 rounded hover:bg-blue-700 transition-colors">
                Contact Support
              </button>
              <button className="w-full text-xs bg-white text-blue-600 py-2 px-3 rounded border border-blue-200 hover:bg-blue-50 transition-colors">
                View Docs
              </button>
            </div>
          </div>
        </div>

        {/* Version Info */}
        <div className="mt-6 text-center">
          <div className="text-xs text-gray-400">
            v1.0.0 • ClientPulse
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;


