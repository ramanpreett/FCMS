import React, { useState } from "react";

const InvoiceForm = ({ clients, onSave }) => {
  const [client, setClient] = useState("");
  const [amount, setAmount] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [status, setStatus] = useState("Unpaid");
  const [description, setDescription] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ client, amount: parseFloat(amount), dueDate, status, description });
    setClient("");
    setAmount("");
    setDueDate("");
    setStatus("Unpaid");
    setDescription("");
  };

  return (
    <form className="space-y-2" onSubmit={handleSubmit}>
      <select className="border p-2 w-full" value={client} onChange={e => setClient(e.target.value)} required>
        <option value="">Select Client</option>
        {clients.map(c => (
          <option key={c._id} value={c._id}>{c.name}</option>
        ))}
      </select>
      <input className="border p-2 w-full" type="number" min="0" step="0.01" placeholder="Enter invoice amount (e.g., 1500.00)" value={amount} onChange={e => setAmount(e.target.value)} required />
      <input className="border p-2 w-full" type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} required />
      <textarea className="border p-2 w-full" placeholder="Describe the services provided or project details" value={description} onChange={e => setDescription(e.target.value)} rows="3" />
      <select className="border p-2 w-full" value={status} onChange={e => setStatus(e.target.value)}>
        <option value="Unpaid">Unpaid</option>
        <option value="Paid">Paid</option>
      </select>
      <button className="bg-green-500 text-white px-3 py-1 rounded" type="submit">Create Invoice</button>
    </form>
  );
};

export default InvoiceForm;
