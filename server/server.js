const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

// Routes will be mounted here by each developer as they complete their module
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/flights', require('./routes/flightRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
