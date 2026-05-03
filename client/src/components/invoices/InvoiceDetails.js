import React from "react";

const InvoiceDetails = ({ invoice, onEdit, onDelete, onMarkAsPaid, onClose }) => {
  if (!invoice) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No invoice selected</p>
      </div>
    );
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800',
      sent: 'bg-blue-100 text-blue-800',
      paid: 'bg-green-100 text-green-800',
      overdue: 'bg-red-100 text-red-800',
      cancelled: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusStyles[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const isOverdue = invoice.status === 'sent' && new Date(invoice.dueDate) < new Date();
  const daysOverdue = isOverdue ? Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24)) : 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would integrate with a PDF generation service
    alert('PDF download functionality would be implemented here');
  };

  const handleSendInvoice = () => {
    // This would integrate with email service
    alert('Email sending functionality would be implemented here');
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header with Actions */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-6">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            <button
              onClick={onClose}
              className="text-gray-600 hover:text-gray-800"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Invoice Details</h1>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print
            </button>

            <button
              onClick={handleDownloadPDF}
              className="bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>

            {invoice.status !== 'paid' && (
              <button
                onClick={handleSendInvoice}
                className="bg-green-100 text-green-700 px-4 py-2 rounded-lg hover:bg-green-200 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Invoice
              </button>
            )}

            <button
              onClick={onEdit}
              className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-200 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          </div>
        </div>

        {/* Status and Alerts */}
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              {getStatusBadge(invoice.status)}
              {isOverdue && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  <p className="text-red-700 text-sm">
                    <span className="font-semibold">Overdue</span> - {daysOverdue} days past due date
                  </p>
                </div>
              )}
            </div>

            {invoice.status !== 'paid' && (
              <button
                onClick={() => onMarkAsPaid(invoice._id)}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Mark as Paid
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Document */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 print:shadow-none print:border-0">
        <div className="p-8">
          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">INVOICE</h1>
              <p className="text-lg text-gray-600">#{invoice.invoiceNumber}</p>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600 mb-2">
                {formatCurrency(invoice.total)}
              </div>
              <p className="text-gray-600">Total Amount</p>
            </div>
          </div>

          {/* Invoice Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">From:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">Your Business Name</p>
                <p className="text-gray-600">123 Business Street</p>
                <p className="text-gray-600">City, State 12345</p>
                <p className="text-gray-600">contact@yourbusiness.com</p>
                <p className="text-gray-600">(555) 123-4567</p>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Bill To:</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold">{invoice.client?.name}</p>
                {invoice.client?.email && <p className="text-gray-600">{invoice.client.email}</p>}
                {invoice.client?.phone && <p className="text-gray-600">{invoice.client.phone}</p>}
                {invoice.client?.address && <p className="text-gray-600">{invoice.client.address}</p>}
                {invoice.project && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Project:</p>
                    <p className="text-sm text-gray-600">{invoice.project.title}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Issue Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.issueDate)}</p>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm font-medium text-gray-700">Due Date</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.dueDate)}</p>
            </div>

            {invoice.paidDate && (
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Paid Date</p>
                <p className="text-lg font-semibold text-green-900">{formatDate(invoice.paidDate)}</p>
              </div>
            )}
          </div>

          {/* Items Table */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Invoice Items</h3>
            
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rate
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.items.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="text-sm text-gray-900">{item.quantity}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm text-gray-900">{formatCurrency(item.rate)}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-medium text-gray-900">{formatCurrency(item.amount)}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end mb-8">
            <div className="w-full max-w-md">
              <div className="bg-gray-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(invoice.subtotal)}</span>
                </div>
                
                {invoice.taxRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax ({invoice.taxRate}%):</span>
                    <span className="font-medium">{formatCurrency(invoice.taxAmount)}</span>
                  </div>
                )}
                
                {invoice.discountAmount > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Discount ({invoice.discountType === 'percentage' ? `${invoice.discountValue}%` : 'Flat'}):
                    </span>
                    <span className="font-medium text-red-600">-{formatCurrency(invoice.discountAmount)}</span>
                  </div>
                )}
                
                <hr className="border-gray-300" />
                
                <div className="flex justify-between text-xl font-bold">
                  <span>Total:</span>
                  <span className="text-blue-600">{formatCurrency(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Information */}
          {invoice.paymentMethod && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-sm font-medium text-green-700">Payment Method</p>
                <p className="text-green-900 capitalize">{invoice.paymentMethod}</p>
                {invoice.transactionId && (
                  <>
                    <p className="text-sm font-medium text-green-700 mt-2">Transaction ID</p>
                    <p className="text-green-900 font-mono text-sm">{invoice.transactionId}</p>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {invoice.notes && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Notes</h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-gray-700 whitespace-pre-wrap">{invoice.notes}</p>
                </div>
              </div>
            )}

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700 whitespace-pre-wrap">{invoice.terms}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons (Print Hidden) */}
      <div className="mt-6 flex justify-end space-x-4 print:hidden">
        <button
          onClick={onDelete}
          className="bg-red-100 text-red-700 px-6 py-2 rounded-lg hover:bg-red-200 flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete Invoice
        </button>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          body { 
            font-size: 12px; 
            color: black !important;
          }
          .print\\:hidden { 
            display: none !important; 
          }
          .print\\:shadow-none { 
            box-shadow: none !important; 
          }
          .print\\:border-0 { 
            border: 0 !important; 
          }
          .bg-gray-50, .bg-blue-50, .bg-green-50 { 
            background-color: #f9f9f9 !important; 
          }
        }
      `}</style>
    </div>
  );
};

export default InvoiceDetails;