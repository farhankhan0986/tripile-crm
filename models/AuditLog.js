import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: ['login', 'customer_created', 'customer_updated', 'booking_created', 'booking_updated'],
      required: true,
    },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    targetId: { type: mongoose.Schema.Types.ObjectId },
    targetModel: { type: String },
    meta: { type: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.models.AuditLog || mongoose.model('AuditLog', auditLogSchema);
