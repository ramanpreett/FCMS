import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client' },
  date: Date,
  notes: String,
  recurring: { type: Boolean, default: false },
  recurringType: { type: String, enum: ['weekly', 'biweekly', 'monthly'], default: null },
});

export default mongoose.model('Meeting', meetingSchema);
