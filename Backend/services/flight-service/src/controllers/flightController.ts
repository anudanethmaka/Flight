import { Request, Response } from 'express';
import axios from 'axios';
import { Flight } from '../models/Flight';
import { CreateFlightDto, UpdateFlightDto } from '@skylink/shared';

const getNotificationServiceUrl = () => process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5014';

export const searchFlights = async (req: Request, res: Response) => {
  const { departure, arrival, date } = req.query;

  const query: any = {};

  if (departure) {
    query.departureAirport = { $regex: new RegExp(String(departure), 'i') };
  }
  if (arrival) {
    query.arrivalAirport = { $regex: new RegExp(String(arrival), 'i') };
  }
  if (date) {
    const searchDate = new Date(String(date));
    if (!isNaN(searchDate.getTime())) {
      const startOfDay = new Date(searchDate.setUTCHours(0, 0, 0, 0));
      const endOfDay = new Date(searchDate.setUTCHours(23, 59, 59, 999));
      query.departureDate = { $gte: startOfDay, $lte: endOfDay };
    }
  }

  try {
    const flights = await Flight.find(query).sort({ departureDate: 1, departureTime: 1 });
    return res.status(200).json(flights);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFlightById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found.' });
    }
    return res.status(200).json(flight);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const createFlight = async (req: Request, res: Response) => {
  const createDto: CreateFlightDto = req.body;

  if (
    !createDto.flightNumber ||
    !createDto.departureAirport ||
    !createDto.arrivalAirport ||
    !createDto.departureDate ||
    !createDto.departureTime ||
    !createDto.arrivalTime ||
    createDto.totalSeats === undefined ||
    createDto.price === undefined
  ) {
    return res.status(400).json({ message: 'All flight fields are required.' });
  }

  try {
    const flight = new Flight({
      flightNumber: createDto.flightNumber.toUpperCase().trim(),
      departureAirport: createDto.departureAirport.trim(),
      arrivalAirport: createDto.arrivalAirport.trim(),
      departureDate: new Date(createDto.departureDate),
      departureTime: createDto.departureTime.trim(),
      arrivalTime: createDto.arrivalTime.trim(),
      totalSeats: createDto.totalSeats,
      availableSeats: createDto.totalSeats, // Initially all seats are available
      price: createDto.price,
      flightStatus: 'Scheduled'
    });

    await flight.save();
    return res.status(201).json(flight);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateFlight = async (req: Request, res: Response) => {
  const { id } = req.params;
  const updateDto: UpdateFlightDto = req.body;

  if (
    !updateDto.flightNumber ||
    !updateDto.departureAirport ||
    !updateDto.arrivalAirport ||
    !updateDto.departureDate ||
    !updateDto.departureTime ||
    !updateDto.arrivalTime ||
    updateDto.totalSeats === undefined ||
    updateDto.price === undefined ||
    !updateDto.flightStatus
  ) {
    return res.status(400).json({ message: 'All flight fields are required.' });
  }

  try {
    const flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found.' });
    }

    const oldStatus = flight.flightStatus;

    // Apply updates
    flight.flightNumber = updateDto.flightNumber.toUpperCase().trim();
    flight.departureAirport = updateDto.departureAirport.trim();
    flight.arrivalAirport = updateDto.arrivalAirport.trim();
    flight.departureDate = new Date(updateDto.departureDate);
    flight.departureTime = updateDto.departureTime.trim();
    flight.arrivalTime = updateDto.arrivalTime.trim();
    flight.price = updateDto.price;

    // Adjust available seats if capacity changed
    const soldSeats = flight.totalSeats - flight.availableSeats;
    flight.totalSeats = updateDto.totalSeats;
    flight.availableSeats = Math.max(0, updateDto.totalSeats - soldSeats);

    flight.flightStatus = updateDto.flightStatus;

    await flight.save();

    // Trigger flight status change notifications if status changed to Delayed or Cancelled
    if (
      flight.flightStatus !== oldStatus &&
      (flight.flightStatus === 'Delayed' || flight.flightStatus === 'Cancelled')
    ) {
      await triggerFlightStatusNotification(flight);
    }

    return res.status(200).json(flight);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteFlight = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const flight = await Flight.findByIdAndDelete(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found.' });
    }
    return res.status(200).json({ message: 'Flight deleted successfully.' });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Internal query to deduct or restock seats
export const adjustSeats = async (req: Request, res: Response) => {
  const { id } = req.params;
  const change = parseInt(String(req.query.change), 10);

  if (isNaN(change)) {
    return res.status(400).json({ message: 'Change query parameter must be an integer.' });
  }

  try {
    const flight = await Flight.findById(id);
    if (!flight) {
      return res.status(404).json({ message: 'Flight not found.' });
    }

    if (flight.availableSeats + change < 0) {
      return res.status(400).json({ message: 'Not enough available seats.' });
    }

    if (flight.availableSeats + change > flight.totalSeats) {
      return res.status(400).json({ message: 'Cannot exceed total seats capacity.' });
    }

    flight.availableSeats += change;
    await flight.save();

    return res.status(200).json(flight);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getFlightCount = async (req: Request, res: Response) => {
  try {
    const count = await Flight.countDocuments();
    return res.status(200).json(count);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Helper: calls NotificationService to report delay/cancellation to passenger list
const triggerFlightStatusNotification = async (flight: any) => {
  const notificationUrl = getNotificationServiceUrl();
  try {
    const payload = {
      flightId: flight._id.toString(),
      flightNumber: flight.flightNumber,
      status: flight.flightStatus,
      message: `Flight ${flight.flightNumber} has been ${flight.flightStatus.toLowerCase()}.`
    };

    console.log(`[FlightService] Triggering status notification to NotificationService: ${flight.flightStatus}`);
    await axios.post(`${notificationUrl}/api/notifications/flight-update`, payload);
  } catch (error: any) {
    console.error(`[FlightService] Failed to trigger notification for flight status change:`, error.message);
  }
};
