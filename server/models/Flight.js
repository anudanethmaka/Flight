const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    departureAirport: { type: String, required: true },
    arrivalAirport: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Boarding', 'Delayed', 'Cancelled', 'Completed'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
