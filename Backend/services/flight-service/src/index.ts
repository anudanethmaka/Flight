import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import flightRoutes from './routes/flightRoutes';
import { Flight } from './models/Flight';

dotenv.config({ override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


const app = express();
const port = process.env.PORT || 5012;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/flights', flightRoutes);

// Database connection & Seeding
const mongoBase = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoUri = mongoBase.includes('?')
  ? mongoBase.replace('?', 'skylink-flights?')
  : `${mongoBase}/skylink-flights`;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('[FlightService] connected to MongoDB');

    // Seed default flights if none exist
    try {
      const flightCount = await Flight.countDocuments();
      if (flightCount === 0) {
        console.log('[FlightService] Seeding default flights...');
        
        const date1 = new Date();
        date1.setDate(date1.getDate() + 3); // 3 days from now
        
        const date2 = new Date();
        date2.setDate(date2.getDate() + 5); // 5 days from now

        await Flight.insertMany([
          {
            flightNumber: 'SLK-101',
            departureAirport: 'CMB',
            arrivalAirport: 'SIN',
            departureDate: date1,
            departureTime: '08:30',
            arrivalTime: '14:50',
            totalSeats: 100,
            availableSeats: 100,
            price: 350.00,
            flightStatus: 'Scheduled'
          },
          {
            flightNumber: 'SLK-202',
            departureAirport: 'SIN',
            arrivalAirport: 'LHR',
            departureDate: date2,
            departureTime: '22:15',
            arrivalTime: '05:40',
            totalSeats: 150,
            availableSeats: 150,
            price: 850.00,
            flightStatus: 'Scheduled'
          }
        ]);
        console.log('[FlightService] Default flights seeded.');
      }
    } catch (seedErr) {
      console.error('[FlightService] Seeding error:', seedErr);
    }

    app.listen(port, () => {
      console.log(`[FlightService] running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('[FlightService] failed to connect to MongoDB', err);
  });

export default app;
