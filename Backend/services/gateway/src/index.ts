import path from 'path';
import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config({ override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


const app = express();
const port = process.env.PORT || 5010;

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Route proxies - maps incoming paths to internal downstream services
const routes = [
  { path: '/api/auth',          target: process.env.AUTH_SERVICE_URL || 'http://localhost:5011' },
  { path: '/api/flights',       target: process.env.FLIGHT_SERVICE_URL || 'http://localhost:5012' },
  { path: '/api/bookings',      target: process.env.BOOKING_SERVICE_URL || 'http://localhost:5013' },
  { path: '/api/notifications', target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5014' },
];

routes.forEach(({ path, target }) => {
  app.use(path, createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: (urlPath) => {
      return path + urlPath;
    }
  }));
});

// Gateway-owned statistics aggregator endpoint
app.get('/api/statistics', async (req, res) => {
  const authUrl = process.env.AUTH_SERVICE_URL || 'http://localhost:5011';
  const flightUrl = process.env.FLIGHT_SERVICE_URL || 'http://localhost:5012';
  const bookingUrl = process.env.BOOKING_SERVICE_URL || 'http://localhost:5013';

  let totalUsers = 0;
  let totalFlights = 0;
  let totalBookings = 0;

  try {
    const authRes = await axios.get(`${authUrl}/api/auth/count`);
    totalUsers = typeof authRes.data === 'number' ? authRes.data : parseInt(authRes.data, 10) || 0;
  } catch (error: any) {
    console.error('Failed to fetch user count from AuthService:', error.message);
  }

  try {
    const flightRes = await axios.get(`${flightUrl}/api/flights/count`);
    totalFlights = typeof flightRes.data === 'number' ? flightRes.data : parseInt(flightRes.data, 10) || 0;
  } catch (error: any) {
    console.error('Failed to fetch flight count from FlightService:', error.message);
  }

  try {
    const bookingRes = await axios.get(`${bookingUrl}/api/bookings/count`);
    totalBookings = typeof bookingRes.data === 'number' ? bookingRes.data : parseInt(bookingRes.data, 10) || 0;
  } catch (error: any) {
    console.error('Failed to fetch booking count from BookingService:', error.message);
  }

  res.json({
    totalUsers,
    totalFlights,
    totalBookings,
  });
});

app.listen(port, () => {
  console.log(`[Gateway] running on port ${port}`);
});
