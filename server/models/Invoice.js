import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, default: 1 },
  rate: { type: Number, required: true },
  amount: { type: Number, required: true } // quantity * rate
});

const invoiceSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  invoiceNumber: { 
    type: String, 
    required: true, 
    unique: true 
  },
  client: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Client', 
    required: true 
  },
  project: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Project' 
  },
  
  // Invoice Details
  items: [invoiceItemSchema],
  subtotal: { type: Number, required: true },
  taxRate: { type: Number, default: 0 }, // percentage
  taxAmount: { type: Number, default: 0 },
  discountType: { type: String, enum: ['percentage', 'flat'], default: 'percentage' },
  discountValue: { type: Number, default: 0 },
  discountAmount: { type: Number, default: 0 },
  total: { type: Number, required: true },
  
  // Dates
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },
  
  // Status and Payment
  status: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Overdue', 'Cancelled'], 
    default: 'Pending' 
  },
  paymentMethod: {
    type: String,
    enum: ['Bank Transfer', 'PayPal', 'Stripe', 'UPI', 'Cash', 'Check', 'Other']
  },
  paidDate: Date,
  paidAmount: { type: Number, default: 0 },
  
  // Additional Info
  notes: String,
  terms: { type: String, default: 'Payment is due within 30 days of invoice date.' },
  
  // System Fields
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Auto-update updatedAt on save
invoiceSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if invoice is overdue
invoiceSchema.virtual('isOverdue').get(function() {
  return this.status === 'Pending' && new Date() > this.dueDate;
});

// Update status to overdue if past due date
invoiceSchema.methods.updateStatus = function() {
  if (this.status === 'Pending' && new Date() > this.dueDate) {
    this.status = 'Overdue';
  }
  return this.status;
};

export default mongoose.model('Invoice', invoiceSchema);
