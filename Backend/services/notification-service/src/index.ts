import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import notificationRoutes from './routes/notificationRoutes';

dotenv.config({ override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


const app = express();
const port = process.env.PORT || 5014;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/notifications', notificationRoutes);

// Database connection
const mongoBase = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoUri = mongoBase.includes('?')
  ? mongoBase.replace('?', 'skylink-notifications?')
  : `${mongoBase}/skylink-notifications`;

mongoose.connect(mongoUri)
  .then(() => {
    console.log('[NotificationService] connected to MongoDB');
    app.listen(port, () => {
      console.log(`[NotificationService] running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('[NotificationService] failed to connect to MongoDB', err);
  });

export default app;
