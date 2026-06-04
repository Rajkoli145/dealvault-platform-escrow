const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const dealSchema = new Schema({
  title: {
    type: String,
    required: [true, 'Deal title is required'],
    minlength: 5,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    minlength: 20
  },
  amount: {
    type: mongoose.Decimal128,
    required: true,
    min: [0, 'Amount must be positive']
  },
  currency: {
    type: String,
    enum: ['INR', 'USD', 'SOL', 'USDC'],
    default: 'INR'
  },
  buyerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['CREATED', 'ACCEPTED', 'FUNDED', 'IN_PROGRESS', 'SUBMITTED', 'APPROVED', 'RELEASED', 'DISPUTED', 'REFUNDED', 'CANCELLED'],
    default: 'CREATED'
  },
  escrowAddress: String,  // Smart contract address
  transactionHash: String, // Blockchain tx hash
  deadline: {
    type: Date,
    required: true,
    validate: {
      validator: function(v) {
        return v > Date.now();
      },
      message: 'Deadline must be in the future'
    }
  },
  deliveryFiles: [{
    filename: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

dealSchema.index({ buyerId: 1, status: 1 });
dealSchema.index({ sellerId: 1, status: 1 });
dealSchema.index({ escrowAddress: 1 });

module.exports = mongoose.model('Deal', dealSchema);
