const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    seatNumber: { type: String, required: true },
    passengerName: { type: String, required: true },
    passengerAge: { type: Number },
    bookingReference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);

