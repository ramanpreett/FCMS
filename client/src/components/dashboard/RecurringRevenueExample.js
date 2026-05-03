import React from 'react';

const RecurringRevenueExample = () => {
  const examples = [
    {
      name: "Monthly Website Maintenance",
      description: "Ongoing maintenance, updates, and monitoring",
      monthlyAmount: 500,
      client: "Tech Startup Inc.",
      status: "Active",
      paymentStatus: "Paid"
    },
    {
      name: "Social Media Management",
      description: "Daily posts, engagement, and content creation",
      monthlyAmount: 800,
      client: "Local Restaurant",
      status: "Active", 
      paymentStatus: "Paid"
    },
    {
      name: "SEO Services",
      description: "Monthly SEO audits and optimization",
      monthlyAmount: 1200,
      client: "E-commerce Store",
      status: "Active",
      paymentStatus: "Paid"
    },
    {
      name: "App Development Retainer",
      description: "Ongoing feature development and bug fixes",
      monthlyAmount: 2000,
      client: "Mobile App Company",
      status: "Active",
      paymentStatus: "Paid"
    }
  ];

  const totalRecurringRevenue = examples.reduce((sum, example) => sum + example.monthlyAmount, 0);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <span className="mr-2">💰</span>
        Recurring Revenue Examples
      </h3>
      
      <div className="mb-4">
        <div className="text-2xl font-bold text-green-600">
          ${totalRecurringRevenue.toLocaleString()}/month
        </div>
        <div className="text-sm text-gray-600">Total Recurring Revenue</div>
      </div>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <div className="font-medium text-gray-800">{example.name}</div>
              <div className="text-sm text-gray-600">{example.description}</div>
              <div className="text-xs text-gray-500">Client: {example.client}</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-green-600">
                ${example.monthlyAmount.toLocaleString()}/mo
              </div>
              <div className="text-xs text-gray-500">
                {example.status} • {example.paymentStatus}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-semibold text-blue-800 mb-2">How to Set Up Recurring Revenue:</h4>
        <ol className="text-sm text-blue-700 space-y-1">
          <li>1. Go to Projects → Create New Project</li>
          <li>2. Check "This is a recurring project"</li>
          <li>3. Enter your monthly amount</li>
          <li>4. Set status to "Active" and payment to "Paid"</li>
          <li>5. Save the project</li>
        </ol>
      </div>
    </div>
  );
};

export default RecurringRevenueExample;


