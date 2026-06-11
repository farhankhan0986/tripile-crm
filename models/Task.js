import mongoose from 'mongoose';

const taskNoteSchema = new mongoose.Schema(
  {
    text: { type: String, required: true, trim: true },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    dueDate: { type: Date, required: true },
    reminderDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'completed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
    notes: [taskNoteSchema],
  },
  { timestamps: true }
);

// Index for efficient dashboard queries
taskSchema.index({ assignedTo: 1, status: 1, dueDate: 1 });
taskSchema.index({ reminderDate: 1, status: 1 });

export default mongoose.models.Task || mongoose.model('Task', taskSchema);
