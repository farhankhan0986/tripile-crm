import mongoose from 'mongoose';
import { SENSITIVE_FIELD_TYPES } from '@/lib/sensitiveFields';

const sensitiveDataSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
    },
    fieldType: {
      type: String,
      enum: SENSITIVE_FIELD_TYPES,
      required: true,
    },
    encryptedValue: {
      type: String,
      required: true,
    },
    iv: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index — one record per customer per fieldType
sensitiveDataSchema.index({ customerId: 1, fieldType: 1 }, { unique: true });

export { SENSITIVE_FIELD_TYPES };

export default mongoose.models.SensitiveData ||
  mongoose.model('SensitiveData', sensitiveDataSchema);
