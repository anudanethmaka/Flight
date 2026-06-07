import { Request, Response } from 'express';
import axios from 'axios';
import { Flight } from '../models/Flight';
import { CreateFlightDto, UpdateFlightDto } from '@skylink/shared';
import { GoogleGenerativeAI } from '@google/generative-ai';

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

export const chatWithAssistant = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ message: 'Message is required' });

  const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyBKrzvtzT3wjhFaeFlpz1ptARXevBBP2bk';
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an AI Flight Search Assistant. 
The user is saying: "${message}". 
Determine if the user is asking to search for flights or just chatting.
If they are searching for flights, extract the departure airport, arrival airport, and date of travel. Crucially, you MUST convert the airport names or cities into their standard 3-letter IATA codes (e.g. London -> LHR, Singapore -> SIN, New York -> JFK, Dubai -> DXB, etc.).
If they are just chatting or greeting, provide a helpful and polite conversational response in the "replyMessage" field.

Return ONLY a raw JSON object with no markdown formatting. It must have the following keys:
- "isSearch": boolean (true if searching for flights, false otherwise)
- "replyMessage": string (A conversational response to the user, e.g. greeting them or asking for more details.)
- "departure": string
- "arrival": string
- "date": string (in YYYY-MM-DD format)

If a field cannot be determined, set it to an empty string.`;

    const result = await model.generateContent(prompt);
    let jsonText = result.response.text();
    
    jsonText = jsonText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let searchParams;
    try {
      searchParams = JSON.parse(jsonText);
    } catch (e) {
      console.error("Failed to parse Gemini output:", jsonText);
      return res.status(500).json({ message: 'AI failed to process the request.' });
    }

    const { isSearch, replyMessage, departure, arrival, date } = searchParams;
    
    if (isSearch === false) {
      return res.status(200).json({
        message: replyMessage || "How can I help you today?",
        departure: "",
        arrival: "",
        date: ""
      });
    }

    const query: any = {};
    if (departure) query.departureAirport = { $regex: new RegExp(String(departure), 'i') };
    if (arrival) query.arrivalAirport = { $regex: new RegExp(String(arrival), 'i') };
    if (date) {
      const searchDate = new Date(String(date));
      if (!isNaN(searchDate.getTime())) {
        const startOfDay = new Date(searchDate.setUTCHours(0, 0, 0, 0));
        const endOfDay = new Date(searchDate.setUTCHours(23, 59, 59, 999));
        query.departureDate = { $gte: startOfDay, $lte: endOfDay };
      }
    }

    const flights = await Flight.find(query).sort({ departureDate: 1, departureTime: 1 }).limit(20);
    
    const responsePayload = {
      message: replyMessage || `I found ${flights.length} flight(s) matching your request.`,
      departure: departure || "",
      arrival: arrival || "",
      date: date || "",
      flights: flights.map(f => ({
        id: f._id,
        flightNumber: f.flightNumber,
        departureAirport: f.departureAirport,
        arrivalAirport: f.arrivalAirport,
        departureDate: f.departureDate,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        totalSeats: f.totalSeats,
        availableSeats: f.availableSeats,
        price: f.price,
        flightStatus: f.flightStatus
      }))
    };
    
    return res.status(200).json(responsePayload);
  } catch (error: any) {
    console.error('AI Assistant Error:', error);
    return res.status(500).json({ message: error.message });
  }
};
