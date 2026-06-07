import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bookingRoutes from './routes/bookingRoutes';

dotenv.config({ override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


const app = express();
const port = process.env.PORT || 5013;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/bookings', bookingRoutes);

// Database connection
const mongoBase = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoUri = mongoBase.includes('?')
  ? mongoBase.replace('?', 'skylink-bookings?')
  : `${mongoBase}/skylink-bookings`;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('[BookingService] connected to MongoDB');
    app.listen(port, () => {
      console.log(`[BookingService] running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('[BookingService] failed to connect to MongoDB', err);
  });

export default app;
