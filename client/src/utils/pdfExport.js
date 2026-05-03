import jsPDF from 'jspdf';

export const generateInvoicePDF = (invoice, client) => {
  const doc = new jsPDF();
  
  // Set font
  doc.setFont('helvetica');
  
  // Header with background
  doc.setFillColor(59, 130, 246); // Blue background
  doc.rect(0, 0, 210, 30, 'F');
  doc.setTextColor(255, 255, 255); // White text
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', 105, 20, { align: 'center' });
  doc.setTextColor(0, 0, 0); // Reset to black text
  
  // Company Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('ClientPulse', 20, 45);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text('Freelance Management System', 20, 55);
  doc.text('Email: contact@clientpulse.com', 20, 65);
  doc.text('Phone: +1 (555) 123-4567', 20, 75);
  
  // Invoice Details
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice Details:', 20, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(`Invoice #: ${invoice._id.slice(-8).toUpperCase()}`, 20, 105);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 115);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 20, 125);
  doc.text(`Status: ${invoice.status}`, 20, 135);
  
  // Client Info
  doc.setFont('helvetica', 'bold');
  doc.text('Bill To:', 120, 95);
  doc.setFont('helvetica', 'normal');
  doc.text(client ? client.name : 'Unknown Client', 120, 105);
  doc.text(client ? client.email : 'No email', 120, 115);
  
  // Line separator
  doc.setDrawColor(200, 200, 200);
  doc.line(20, 145, 190, 145);
  
  // Invoice Items
  doc.setFont('helvetica', 'bold');
  doc.text('Description', 20, 160);
  doc.text('Amount', 150, 160);
  
  doc.setFont('helvetica', 'normal');
  const description = invoice.description || 'Professional Services';
  // Split description into multiple lines if it's too long
  const maxWidth = 120;
  const lines = doc.splitTextToSize(description, maxWidth);
  doc.text(lines, 20, 175);
  doc.text(`$${invoice.amount.toFixed(2)}`, 150, 175);
  
  // Line separator
  doc.line(20, 185, 190, 185);
  
  // Total
  doc.setFont('helvetica', 'bold');
  doc.text('Total:', 130, 200);
  doc.text(`$${invoice.amount.toFixed(2)}`, 150, 200);
  
  // Footer
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for your business!', 105, 250, { align: 'center' });
  doc.text('Please make payment within 30 days of invoice date.', 105, 255, { align: 'center' });
  
  // Save the PDF
  const fileName = `invoice-${invoice._id.slice(-8)}-${client ? client.name.replace(/\s+/g, '-') : 'client'}.pdf`;
  doc.save(fileName);
};
