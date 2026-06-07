import { Request, Response } from 'express';
import axios from 'axios';
import { Notification } from '../models/Notification';
import { SendNotificationDto, FlightUpdateNotificationDto } from '@skylink/shared';

const getBookingServiceUrl = () => process.env.BOOKING_SERVICE_URL || 'http://localhost:5013';

const simulateEmail = (userId: string, type: string, message: string) => {
  console.log(
    `\n================================================================================\n` +
    `[EMAIL SIMULATION]\n` +
    `To User ID: ${userId}\n` +
    `Type: ${type}\n` +
    `Timestamp: ${new Date().toISOString()}\n` +
    `Subject: SkyLink System Alert - ${type}\n` +
    `Message Body:\n` +
    `Dear SkyLink Passenger,\n\n` +
    `${message}\n\n` +
    `Thank you for choosing SkyLink Airlines!\n` +
    `================================================================================\n`
  );
};

export const getMyNotifications = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  try {
    const notifications = await Notification.find({ userId: req.user.userId }).sort({ createdAt: -1 });
    return res.status(200).json(notifications);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Unauthorized' });

  const { id } = req.params;

  try {
    const notification = await Notification.findById(id);
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found.' });
    }

    if (notification.userId !== req.user.userId) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    notification.isRead = true;
    await notification.save();

    return res.status(200).json(notification);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Internal endpoint triggered by BookingService
export const sendNotification = async (req: Request, res: Response) => {
  const { userId, message, type }: SendNotificationDto = req.body;

  if (!userId || !message || !type) {
    return res.status(400).json({ message: 'userId, message and type are required.' });
  }

  try {
    const notification = new Notification({
      userId,
      message,
      type,
      isRead: false,
      emailSimulated: true
    });

    await notification.save();

    simulateEmail(userId, type, message);

    return res.status(200).json(notification);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Internal endpoint called by FlightService when a flight status updates
export const handleFlightUpdate = async (req: Request, res: Response) => {
  const { flightId, flightNumber, status, message }: FlightUpdateNotificationDto = req.body;

  if (!flightId || !flightNumber || !status || !message) {
    return res.status(400).json({ message: 'flightId, flightNumber, status and message are required.' });
  }

  const bookingServiceUrl = getBookingServiceUrl();
  let passengers: any[] = [];

  try {
    // 1. Fetch passengers having bookings for this flight
    try {
      const response = await axios.get(`${bookingServiceUrl}/api/bookings/passengers?flightId=${flightId}`);
      passengers = response.data;
    } catch (err: any) {
      console.error('[NotificationService] BookingService connectivity error:', err.message);
      return res.status(503).json({ message: 'Booking Service is currently unavailable.' });
    }

    if (!passengers || !passengers.length) {
      console.log(`[NotificationService] No passengers booked for flight ${flightNumber}. No notifications generated.`);
      return res.status(200).json({ message: 'No notifications generated. No active bookings found.' });
    }

    const notificationType = status === 'Cancelled' ? 'FlightCancellation' : 'FlightDelay';
    
    // 2. Loop and generate notifications + simulated emails
    const notificationsToInsert = [];
    for (const passenger of passengers) {
      const customMsg = `Flight ${flightNumber} update: Status changed to ${status}. Details: ${message} (Ref: ${passenger.bookingReference})`;
      
      notificationsToInsert.push({
        userId: passenger.userId,
        message: customMsg,
        type: notificationType,
        isRead: false,
        emailSimulated: true,
        createdAt: new Date()
      });

      simulateEmail(passenger.userId, notificationType, customMsg);
    }

    await Notification.insertMany(notificationsToInsert);

    return res.status(200).json({
      message: `Notifications created and emails simulated for ${passengers.length} passengers.`
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
