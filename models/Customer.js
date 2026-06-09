import mongoose from 'mongoose';

const PHONE_REGEX = /^[+\d\s\-(). ]+$/;

const customerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: {
      type: String,
      trim: true,
      validate: {
        validator: function (v) {
          if (!v || v.trim() === '') return true; // optional — checked by at-least-one validator
          return PHONE_REGEX.test(v.trim());
        },
        message: 'Phone number can only contain digits, spaces, +, -, and parentheses.',
      },
    },
    email: { type: String, trim: true, lowercase: true },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    notes: { type: String },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Unique sparse index on email — allows multiple null/empty values but enforces uniqueness when set
customerSchema.index(
  { email: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { email: { $exists: true, $ne: '' } },
  }
);

// At least one of phone or email must be present
customerSchema.pre('validate', async function () {
  const hasPhone = this.phone && this.phone.trim() !== '';
  const hasEmail = this.email && this.email.trim() !== '';
  if (!hasPhone && !hasEmail) {
    this.invalidate('phone', 'Either Phone Number or Email Address is required.');
  }
});

export default mongoose.models.Customer || mongoose.model('Customer', customerSchema);
