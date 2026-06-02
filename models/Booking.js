import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer', required: true },
    airline: { type: String, trim: true },
    pnr: { type: String, trim: true, uppercase: true },
    travelDate: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    notes: { type: String },
    payment: {
      status: {
        type: String,
        enum: ['unpaid', 'paid', 'refunded', 'partial'],
        default: 'unpaid',
      },
      transactionId: { type: String, trim: true },
      gatewayName: { type: String, trim: true },
      last4Digits: { type: String, maxlength: 4, trim: true },
    },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
