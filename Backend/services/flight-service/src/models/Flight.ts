import { Schema, model, Document } from 'mongoose';

export interface IFlight extends Document {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: Date;
  departureTime: string;
  arrivalTime: string;
  availableSeats: number;
  totalSeats: number;
  price: number;
  flightStatus: 'Scheduled' | 'Delayed' | 'Cancelled';
}

const FlightSchema = new Schema<IFlight>({
  flightNumber: { type: String, required: true, uppercase: true, trim: true },
  departureAirport: { type: String, required: true, trim: true },
  arrivalAirport: { type: String, required: true, trim: true },
  departureDate: { type: Date, required: true },
  departureTime: { type: String, required: true, trim: true },
  arrivalTime: { type: String, required: true, trim: true },
  availableSeats: { type: Number, required: true },
  totalSeats: { type: Number, required: true },
  price: { type: Number, required: true },
  flightStatus: { type: String, enum: ['Scheduled', 'Delayed', 'Cancelled'], default: 'Scheduled' }
});

export const Flight = model<IFlight>('Flight', FlightSchema);
