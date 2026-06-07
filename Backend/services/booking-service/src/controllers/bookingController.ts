import { Request, Response } from 'express';
import axios from 'axios';
import crypto from 'crypto';
import { Booking } from '../models/Booking';
import { CreateBookingDto, BookingDetailsDto, TicketDetailsDto } from '@skylink/shared';

const getFlightServiceUrl = () => process.env.FLIGHT_SERVICE_URL || 'http://localhost:5012';
const getNotificationServiceUrl = () => process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5014';

const mapToDetailsDto = (b: any): BookingDetailsDto => {
  return {
    id: b._id.toString(),
    bookingReference: b.bookingReference,
    userId: b.userId,
    flightId: b.flightId,
    bookingDate: b.bookingDate,
    status: b.status,
    totalPrice: b.totalPrice,
    tickets: b.tickets.map((t: any) => ({
      id: t._id ? t._id.toString() : '',
      ticketNumber: t.ticketNumber,
      passengerName: t.passengerName,
      seatNumber: t.seatNumber
    }))
  };
};

export const bookFlight = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { flightId, passengers }: CreateBookingDto = req.body;

  if (!flightId || !passengers || !passengers.length) {
    return res.status(400).json({ message: 'Flight ID and passengers list are required.' });
  }

  const flightUrl = getFlightServiceUrl();
  const notificationUrl = getNotificationServiceUrl();
  const passengerCount = passengers.length;

  try {
    // 1. Fetch flight information from FlightService
    let flight: any = null;
    try {
      const flightResponse = await axios.get(`${flightUrl}/api/flights/${flightId}`);
      flight = flightResponse.data;
    } catch (err: any) {
      if (err.response?.status === 404) {
        return res.status(400).json({ message: 'Selected flight does not exist.' });
      }
      console.error('[BookingService] FlightService connectivity error:', err.message);
      return res.status(503).json({ message: 'Flight Service is currently unavailable.' });
    }

    if (!flight) {
      return res.status(400).json({ message: 'Error reading flight details.' });
    }

    if (flight.availableSeats < passengerCount) {
      return res.status(400).json({
        message: `Not enough available seats on this flight. Available: ${flight.availableSeats}`
      });
    }

    // 2. Lock/Deduct seats in FlightService
    try {
      await axios.put(`${flightUrl}/api/flights/${flightId}/seats?change=-${passengerCount}`);
    } catch (err: any) {
      console.error('[BookingService] Failed to deduct seats in FlightService:', err.message);
      return res.status(500).json({ message: 'Failed to reserve seats with Flight Service. Please try again.' });
    }

    // 3. Create Booking & Tickets
    const refCode = 'SLK-' + crypto.randomBytes(4).toString('hex').toUpperCase();
    
    const tickets = passengers.map(p => ({
      ticketNumber: 'TKT-' + crypto.randomBytes(5).toString('hex').toUpperCase(),
      passengerName: p.passengerName.trim(),
      seatNumber: p.seatNumber.toUpperCase().trim()
    }));

    const booking = new Booking({
      bookingReference: refCode,
      userId: req.user.userId,
      flightId: flightId,
      status: 'Confirmed',
      totalPrice: flight.price * passengerCount,
      tickets
    });

    await booking.save();

    // 4. Send booking confirmation alert asynchronously
    try {
      const payload = {
        userId: req.user.userId,
        message: `Booking confirmed! Ref: ${booking.bookingReference} for Flight ${flight.flightNumber} from ${flight.departureAirport} to ${flight.arrivalAirport}.`,
        type: 'BookingConfirmation'
      };
      await axios.post(`${notificationUrl}/api/notifications/send`, payload);
    } catch (err: any) {
      console.error('[BookingService] Failed to dispatch confirmation notification:', err.message);
    }

    return res.status(200).json(mapToDetailsDto(booking));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyBookings = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const bookings = await Booking.find({ userId: req.user.userId }).sort({ bookingDate: -1 });
    return res.status(200).json(bookings.map(mapToDetailsDto));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBookingById = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Authorization check: Owner, Admin, or Staff
    if (
      booking.userId !== req.user.userId &&
      req.user.role !== 'Administrator' &&
      req.user.role !== 'Staff'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    return res.status(200).json(mapToDetailsDto(booking));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const cancelBooking = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;

  try {
    const booking = await Booking.findById(id);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }

    // Authorization check: Owner, Admin, or Staff
    if (
      booking.userId !== req.user.userId &&
      req.user.role !== 'Administrator' &&
      req.user.role !== 'Staff'
    ) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    if (booking.status === 'Cancelled') {
      return res.status(400).json({ message: 'Booking is already cancelled.' });
    }

    const flightUrl = getFlightServiceUrl();
    const notificationUrl = getNotificationServiceUrl();
    const passengerCount = booking.tickets.length;

    // 1. Restock seats in FlightService
    try {
      await axios.put(`${flightUrl}/api/flights/${booking.flightId}/seats?change=${passengerCount}`);
    } catch (err: any) {
      console.error('[BookingService] Failed to restock seats in FlightService:', err.message);
      // Continue cancellation anyway to preserve consistency of this action, but log the warning
    }

    // 2. Change status
    booking.status = 'Cancelled';
    await booking.save();

    // 3. Dispatch cancellation notification
    try {
      const payload = {
        userId: booking.userId,
        message: `Your booking Ref: ${booking.bookingReference} has been cancelled successfully.`,
        type: 'Cancellation'
      };
      await axios.post(`${notificationUrl}/api/notifications/send`, payload);
    } catch (err: any) {
      console.error('[BookingService] Failed to dispatch cancellation notification:', err.message);
    }

    return res.status(200).json(mapToDetailsDto(booking));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await Booking.find().sort({ bookingDate: -1 });
    return res.status(200).json(bookings.map(mapToDetailsDto));
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getBookingCount = async (req: Request, res: Response) => {
  try {
    const count = await Booking.countDocuments();
    return res.status(200).json(count);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Internal query: retrieves list of passenger User IDs and Reference codes for a flight ID
export const getPassengersForFlight = async (req: Request, res: Response) => {
  const flightId = String(req.query.flightId);

  if (!flightId) {
    return res.status(400).json({ message: 'flightId query parameter is required.' });
  }

  try {
    const bookings = await Booking.find({ flightId, status: 'Confirmed' });
    const passengers = bookings.map(b => ({
      userId: b.userId,
      bookingReference: b.bookingReference
    }));

    return res.status(200).json(passengers);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
