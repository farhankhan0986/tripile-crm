import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      enum: [
        'login',
        'customer_created',
        'customer_updated',
        'customer_archived',
        'customer_deleted',
        'booking_created',
        'booking_updated',
        'booking_deleted',
        'sensitive_data_created',
        'sensitive_data_updated',
        'sensitive_data_viewed',
      ],
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
