import path from 'path';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import { User } from './models/User';

dotenv.config({ override: true });
dotenv.config({ path: path.resolve(__dirname, '../../../.env'), override: true });


const app = express();
const port = process.env.PORT || 5011;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Database connection & Seeding
const mongoBase = process.env.MONGO_URI || 'mongodb://localhost:27017';
const mongoUri = mongoBase.includes('?')
  ? mongoBase.replace('?', 'skylink-auth?')
  : `${mongoBase}/skylink-auth`;

mongoose.connect(mongoUri)
  .then(async () => {
    console.log('[AuthService] connected to MongoDB');
    
    // Seed default Admin user if not exists
    try {
      const adminExists = await User.findOne({ role: 'Administrator' });
      if (!adminExists) {
        console.log('[AuthService] Seeding default administrator...');
        const admin = new User({
          username: 'admin',
          email: 'admin@skylink.com',
          fullName: 'System Administrator',
          role: 'Administrator',
          password: 'AdminPassword123' // Will be hashed automatically by pre-save hook
        });
        await admin.save();
        console.log('[AuthService] Seeding completed successfully. (admin / AdminPassword123)');
      }
    } catch (seedErr) {
      console.error('[AuthService] Seeding error:', seedErr);
    }

    app.listen(port, () => {
      console.log(`[AuthService] running on port ${port}`);
    });
  })
  .catch((err) => {
    console.error('[AuthService] failed to connect to MongoDB', err);
  });
export default app;
