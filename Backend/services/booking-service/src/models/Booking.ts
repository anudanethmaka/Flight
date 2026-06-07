import { Schema, model, Document } from 'mongoose';

export interface ITicket {
  ticketNumber: string;
  passengerName: string;
  seatNumber: string;
}

export interface IBooking extends Document {
  bookingReference: string;
  userId: string;
  flightId: string;
  bookingDate: Date;
  status: 'Confirmed' | 'Cancelled';
  totalPrice: number;
  tickets: ITicket[];
}

const TicketSchema = new Schema<ITicket>({
  ticketNumber: { type: String, required: true },
  passengerName: { type: String, required: true, trim: true },
  seatNumber: { type: String, required: true, uppercase: true, trim: true }
});

const BookingSchema = new Schema<IBooking>({
  bookingReference: { type: String, required: true, unique: true },
  userId: { type: String, required: true }, // Store logical ID (Mongoose string or ObjectId)
  flightId: { type: String, required: true }, // Store logical ID of the flight
  bookingDate: { type: Date, default: Date.now },
  status: { type: String, enum: ['Confirmed', 'Cancelled'], default: 'Confirmed' },
  totalPrice: { type: Number, required: true },
  tickets: [TicketSchema]
});

export const Booking = model<IBooking>('Booking', BookingSchema);
