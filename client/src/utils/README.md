# PDF Export Utility

This utility provides PDF export functionality for invoices in the ClientPulse application.

## Features

- **Professional Invoice Layout**: Clean, professional design with company branding
- **Dynamic Content**: Automatically includes invoice details, client information, and descriptions
- **Text Wrapping**: Handles long descriptions by wrapping text appropriately
- **Custom Filenames**: Generates descriptive filenames based on invoice ID and client name

## Usage

```javascript
import { generateInvoicePDF } from '../utils/pdfExport';

// Generate and download PDF
generateInvoicePDF(invoice, client);
```

## PDF Structure

The generated PDF includes:

1. **Header**: Blue background with "INVOICE" title
2. **Company Information**: ClientPulse branding and contact details
3. **Invoice Details**: Invoice number, dates, and status
4. **Client Information**: Bill-to section with client name and email
5. **Service Description**: Custom description or default "Professional Services"
6. **Amount**: Total amount with proper formatting
7. **Footer**: Thank you message and payment terms

## Dependencies

- `jspdf`: JavaScript PDF generation library

## File Naming Convention

PDFs are saved with the format: `invoice-{last8chars}-{clientname}.pdf`

Example: `invoice-12345678-John-Doe.pdf`

