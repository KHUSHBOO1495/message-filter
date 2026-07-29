const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
    },
    customerEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    customerType: {
      type: String,
      required: true,
      enum: ['regular', 'enterprise'],
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      enum: ['Delivery', 'Payment', 'Refund', 'Login', 'Account', 'Order', 'Other'],
      default: 'Other',
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative', 'Angry'],
      default: 'Neutral',
    },
    tags: {
      type: [String],
      default: [],
    },
    suggestedReply: {
      type: String,
      default: '',
    },
    isAbusive: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    feedbackCorrect: {
      type: Boolean,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Ticket', TicketSchema);
