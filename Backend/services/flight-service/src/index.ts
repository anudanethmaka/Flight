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
      await Flight.deleteMany({}); // Clear existing flights for fresh random seed
      const flightCount = await Flight.countDocuments();
      if (flightCount === 0) {
        console.log('[FlightService] Seeding default flights...');
        
        const airports = ['CMB', 'SIN', 'LHR', 'JFK', 'DXB', 'SYD', 'NRT', 'FRA', 'YYZ', 'HKG', 'DEL', 'CDG', 'AMS'];
        const statuses = ['Scheduled', 'Delayed', 'Cancelled'];
        const flightsToSeed = [];

        for (let i = 1; i <= 300; i++) {
          const depAirport = airports[Math.floor(Math.random() * airports.length)];
          let arrAirport = airports[Math.floor(Math.random() * airports.length)];
          while (arrAirport === depAirport) {
            arrAirport = airports[Math.floor(Math.random() * airports.length)];
          }

          const dateOffset = Math.floor(Math.random() * 30); // 0 to 30 days from now
          const flightDate = new Date();
          flightDate.setDate(flightDate.getDate() + dateOffset);

          const depHour = Math.floor(Math.random() * 24);
          const depMinute = Math.floor(Math.random() * 60);
          const departureTime = `${depHour.toString().padStart(2, '0')}:${depMinute.toString().padStart(2, '0')}`;

          const arrHour = (depHour + Math.floor(Math.random() * 12) + 1) % 24;
          const arrMinute = Math.floor(Math.random() * 60);
          const arrivalTime = `${arrHour.toString().padStart(2, '0')}:${arrMinute.toString().padStart(2, '0')}`;

          const totalSeats = 50 + Math.floor(Math.random() * 250); // 50 to 300 seats
          const availableSeats = Math.floor(Math.random() * totalSeats); // 0 to totalSeats
          const price = 100 + Math.floor(Math.random() * 1400); // 100 to 1500

          const statusRoll = Math.random();
          let flightStatus = 'Scheduled';
          if (statusRoll > 0.8) flightStatus = 'Delayed';
          if (statusRoll > 0.95) flightStatus = 'Cancelled';

          flightsToSeed.push({
            flightNumber: `SLK-${100 + i}`,
            departureAirport: depAirport,
            arrivalAirport: arrAirport,
            departureDate: flightDate,
            departureTime,
            arrivalTime,
            totalSeats,
            availableSeats,
            price,
            flightStatus
          });
        }

        await Flight.insertMany(flightsToSeed);
        console.log(`[FlightService] Successfully seeded ${flightsToSeed.length} random flights.`);
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
