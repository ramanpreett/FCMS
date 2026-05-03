import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  status: { type: String, enum: ['pending', 'in-progress', 'completed'], default: 'pending' },
  dueDate: Date,
  completedAt: Date,
  assignedTo: String
});

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: { type: Date, required: true },
  completed: { type: Boolean, default: false },
  completedAt: Date
});

const communicationLogSchema = new mongoose.Schema({
  type: { type: String, enum: ['note', 'meeting', 'email', 'call'], required: true },
  title: { type: String, required: true },
  content: String,
  date: { type: Date, default: Date.now },
  attachments: [String] // File URLs
});

const projectSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  platform: { type: String, enum: ['Upwork', 'Fiverr', 'Direct', 'LinkedIn', 'Other'], default: 'Direct' },
  
  // Status and Progress
  status: { 
    type: String, 
    enum: ['Active', 'Completed', 'On Hold', 'Cancelled'], 
    default: 'Active' 
  },
  progress: { type: Number, min: 0, max: 100, default: 0 },
  
  // Timeline
  startDate: { type: Date, required: true },
  deadline: { type: Date, required: true },
  completedDate: Date,
  
  // Financial
  budget: { type: Number, required: true },
  paymentStatus: { 
    type: String, 
    enum: ['Pending', 'Paid', 'Partially Paid'], 
    default: 'Pending' 
  },
  amountPaid: { type: Number, default: 0 },
  
  // Project Details
  tasks: [taskSchema],
  milestones: [milestoneSchema],
  communicationLogs: [communicationLogSchema],
  
  // Files and Attachments
  attachments: [{
    name: String,
    url: String,
    type: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Invoices
  invoices: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Invoice' }],
  
  // Tags and Categories
  tags: [String],
  category: String,
  
  // Additional Info
  notes: String,
  requirements: String,
  deliverables: [String],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
projectSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('Project', projectSchema);


