import React from "react";

const InvoiceList = ({ invoices, clients, onDelete, onMarkPaid, onExportPDF }) => (
  <ul>
    {invoices.map(inv => {
      const client = clients.find(c => c._id === inv.client);
      return (
        <li key={inv._id} className="flex flex-col md:flex-row justify-between items-center border-b py-2">
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-bold">Invoice #{inv._id.slice(-4)}</span>
              <span className={`text-xs px-2 py-1 rounded ${inv.status === "Paid" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{inv.status}</span>
            </div>
            <div className="text-sm text-gray-600">
              {client ? client.name : "Unknown"} - ${inv.amount.toFixed(2)}
            </div>
            <div className="text-xs text-gray-500">
              Due: {new Date(inv.dueDate).toLocaleDateString()}
            </div>
            {inv.description && (
              <div className="text-xs text-gray-600 mt-1">
                {inv.description}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-2 md:mt-0">
            {inv.status === "Unpaid" && <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => { console.log('Mark paid button clicked for invoice:', inv._id); onMarkPaid(inv._id); }}>Mark Paid</button>}
            <button className="bg-red-500 text-white px-2 py-1 rounded" onClick={() => onDelete(inv._id)}>Delete</button>
            <button className="bg-gray-500 text-white px-2 py-1 rounded" onClick={() => onExportPDF(inv)}>Export PDF</button>
          </div>
        </li>
      );
    })}
  </ul>
);

export default InvoiceList;
