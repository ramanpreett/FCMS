// server.js
import express from "express";
import cors from 'cors';
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "./models/User.js";
import Client from "./models/Client.js";
import Invoice from "./models/Invoice.js";
import Meeting from "./models/Meeting.js";
import Project from "./models/Project.js";
import automationService from './services/automationService.js';
import dotenv from 'dotenv';
dotenv.config(); 
const app = express();
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001", "https://ramanpreett.github.io"],
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})

// JWT Authentication Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret123");
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }
    
    req.userId = decoded.userId;
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ error: "Invalid token" });
  }
};

// ----- User Routes -----
app.post('/api/signup', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    // Create new user
    const user = new User({
      email,
      password,
      name
    });
    
    await user.save();
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET || "supersecret123",
      { expiresIn: '7d' }
    );
    
    res.status(201).json({ 
      token, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ error: "User with this email already exists" });
    }
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }
    
    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      process.env.JWT_SECRET || "supersecret123",
      { expiresIn: '7d' }
    );
    
    res.json({ 
      token, 
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get current user profile
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user profile
app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const { name, email } = req.body;
    const updateData = {};
    
    if (name) updateData.name = name;
    if (email) {
      // Check if email is already taken by another user
      const existingUser = await User.findOne({ email, _id: { $ne: req.userId } });
      if (existingUser) {
        return res.status(400).json({ error: "Email is already taken" });
      }
      updateData.email = email;
    }
    
    const user = await User.findByIdAndUpdate(
      req.userId, 
      updateData, 
      { new: true, runValidators: true }
    ).select('-password');
    
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Change password
app.put('/api/user/change-password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current password and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }
    
    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Client Routes -----
app.get('/api/clients', auth, async (req, res) => {
  try {
    const clients = await Client.find({ user: req.userId });
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/clients', auth, async (req, res) => {
  try {
    const client = new Client({ ...req.body, user: req.userId });
    await client.save();
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/clients/:id', auth, async (req, res) => {
  try {
    const client = await Client.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!client) return res.status(404).json({ error: 'Client not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Invoice Routes -----

// Get all invoices with filtering and sorting
app.get('/api/invoices', auth, async (req, res) => {
  try {
    const { status, client, dateFrom, dateTo, sortBy, sortOrder } = req.query;
    
  // Build filter object
  let filter = {};
  // Always scope invoices to the authenticated user
  filter.user = req.userId;
    if (status && status !== 'all') filter.status = status;
    if (client && client !== 'all') filter.client = client;
    if (dateFrom || dateTo) {
      filter.issueDate = {};
      if (dateFrom) filter.issueDate.$gte = new Date(dateFrom);
      if (dateTo) filter.issueDate.$lte = new Date(dateTo);
    }
    
    // Build sort object
    let sort = {};
    if (sortBy) {
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    } else {
      sort.issueDate = -1; // Default: newest first
    }
    
    const invoices = await Invoice.find(filter)
      .populate('client', 'name email')
      .populate('project', 'title')
      .sort(sort);
      
    // Update overdue status
    invoices.forEach(invoice => {
      if (invoice.status === 'Pending' && new Date() > invoice.dueDate) {
        invoice.status = 'Overdue';
        invoice.save();
      }
    });
    
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get single invoice
app.get('/api/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.userId })
      .populate('client')
      .populate('project');
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Generate invoice number
app.get('/api/invoices/generate-number', auth, async (req, res) => {
  try {
    const year = new Date().getFullYear();
    const lastInvoice = await Invoice.findOne({ 
      invoiceNumber: new RegExp(`^INV-${year}`),
      user: req.userId
    }).sort({ invoiceNumber: -1 });
    
    let nextNumber = 1;
    if (lastInvoice) {
      const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-')[2]);
      nextNumber = lastNumber + 1;
    }
    
    const invoiceNumber = `INV-${year}-${nextNumber.toString().padStart(4, '0')}`;
    res.json({ invoiceNumber });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new invoice
app.post('/api/invoices', auth, async (req, res) => {
  try {
    // Calculate totals
    const { items, taxRate = 0, discountType = 'percentage', discountValue = 0 } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * (taxRate / 100);
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
    
    const total = subtotal + taxAmount - discountAmount;
    
    // Update item amounts
    const updatedItems = items.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
    
    const invoice = new Invoice({
      ...req.body,
      user: req.userId,
      items: updatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      total
    });
    
    await invoice.save();
    
    // Populate and return
    await invoice.populate('client', 'name email');
    await invoice.populate('project', 'title');
    
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update invoice
app.put('/api/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.userId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Don't allow editing paid invoices
    if (invoice.status === 'Paid') {
      return res.status(400).json({ error: 'Cannot edit paid invoices' });
    }
    
    // Recalculate totals
    const { items, taxRate = 0, discountType = 'percentage', discountValue = 0 } = req.body;
    
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
    const taxAmount = subtotal * (taxRate / 100);
    
    let discountAmount = 0;
    if (discountType === 'percentage') {
      discountAmount = subtotal * (discountValue / 100);
    } else {
      discountAmount = discountValue;
    }
    
    const total = subtotal + taxAmount - discountAmount;
    
    const updatedItems = items.map(item => ({
      ...item,
      amount: item.quantity * item.rate
    }));
    
    Object.assign(invoice, {
      ...req.body,
      items: updatedItems,
      subtotal,
      taxAmount,
      discountAmount,
      total
    });
    
    await invoice.save();
    
    await invoice.populate('client', 'name email');
    await invoice.populate('project', 'title');
    
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark invoice as paid
app.patch('/api/invoices/:id/pay', auth, async (req, res) => {
  try {
    const { paymentMethod, paidAmount, paidDate } = req.body;
    
    // Ensure invoice belongs to the authenticated user
    let invoice = await Invoice.findOne({ _id: req.params.id, user: req.userId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }

    invoice.status = 'Paid';
    invoice.paymentMethod = paymentMethod;
    invoice.paidAmount = paidAmount || invoice.total;
    invoice.paidDate = paidDate || new Date();
    await invoice.save();
    invoice = await invoice.populate('client', 'name email').populate('project', 'title');
    
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update invoice status
app.patch('/api/invoices/:id/status', auth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const invoice = await Invoice.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { status },
      { new: true }
    ).populate('client', 'name email').populate('project', 'title');

    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    res.json(invoice);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete invoice
app.delete('/api/invoices/:id', auth, async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ _id: req.params.id, user: req.userId });
    if (!invoice) {
      return res.status(404).json({ error: 'Invoice not found' });
    }
    
    // Don't allow deleting paid invoices
    if (invoice.status === 'Paid') {
      return res.status(400).json({ error: 'Cannot delete paid invoices' });
    }
    
  const deleted = await Invoice.findOneAndDelete({ _id: req.params.id, user: req.userId });
  if (!deleted) return res.status(404).json({ error: 'Invoice not found' });
  res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get invoice statistics
app.get('/api/invoices/stats/dashboard', auth, async (req, res) => {
  try {
  const invoices = await Invoice.find({ user: req.userId });
    
    const stats = {
      total: invoices.length,
      paid: invoices.filter(inv => inv.status === 'Paid').length,
      pending: invoices.filter(inv => inv.status === 'Pending').length,
      overdue: invoices.filter(inv => 
        inv.status === 'Pending' && new Date() > inv.dueDate
      ).length,
      totalRevenue: invoices
        .filter(inv => inv.status === 'Paid')
        .reduce((sum, inv) => sum + inv.total, 0),
      pendingAmount: invoices
        .filter(inv => inv.status === 'Pending')
        .reduce((sum, inv) => sum + inv.total, 0),
      overdueAmount: invoices
        .filter(inv => inv.status === 'Pending' && new Date() > inv.dueDate)
        .reduce((sum, inv) => sum + inv.total, 0)
    };
    
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Meeting Routes -----
app.get('/api/meetings', auth, async (req, res) => {
  try {
    const meetings = await Meeting.find({ user: req.userId }).populate('client');
    res.json(meetings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/meetings', auth, async (req, res) => {
  try {
    const meeting = new Meeting({ ...req.body, user: req.userId });
    await meeting.save();
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/meetings/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    );
    if (!meeting) {
      return res.status(404).json({ error: 'Meeting not found' });
    }
    res.json(meeting);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/meetings/:id', auth, async (req, res) => {
  try {
    const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Project Routes -----
app.get('/api/projects', auth, async (req, res) => {
  try {
    const projects = await Project.find({ user: req.userId }).populate('client');
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects', auth, async (req, res) => {
  try {
    const project = new Project({ ...req.body, user: req.userId });
    await project.save();
    
    // Populate the client data before sending response
    await project.populate('client');
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, user: req.userId }).populate('client');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    ).populate('client');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/projects/:id/update', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    ).populate('client');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/api/projects/:id', auth, async (req, res) => {
  try {
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true }
    ).populate('client');
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/projects/:id', auth, async (req, res) => {
  try {
    const deleted = await Project.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ error: 'Project not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ----- Automation Routes -----
app.post('/api/automation/linkedin', auth, async (req, res) => {
  try {
    const clientData = await automationService.extractFromLinkedIn(req.body.linkedinUrl);
    const client = await automationService.generateClientProfile(clientData, req.userId);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automation/upwork', auth, async (req, res) => {
  try {
    const clientData = await automationService.extractFromUpwork(req.body.upworkUrl);
    const client = await automationService.generateClientProfile(clientData, req.userId);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automation/fiverr', auth, async (req, res) => {
  try {
    const clientData = await automationService.extractFromFiverr(req.body.fiverrUrl);
    const client = await automationService.generateClientProfile(clientData, req.userId);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/automation/email', auth, async (req, res) => {
  try {
    const clientData = await automationService.parseEmailContent(req.body.emailContent);
    const client = await automationService.generateClientProfile(clientData, req.userId);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/webhook/client', async (req, res) => {
  try {
    const client = await automationService.handleWebhook(req.body);
    res.json(client);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

