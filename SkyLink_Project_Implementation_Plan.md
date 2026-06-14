# SkyLink Flight Management System — Main Implementation Plan

This document is the **single source of truth** for the project. It covers architecture, database design, API contracts, the shared design system, and a phase-by-phase build guide for all five developers. Individual phase documents (one per developer) can be split out from this file later, but this plan must remain the reference for how everything fits together.

---

## 1. Project Overview

**Project Name:** SkyLink Flight Management System

**Goal:** A web application where:
- **Users (Passengers)** can register, log in, search flights, view flight details, book tickets (with seat selection), view their booking history, cancel bookings, receive notifications, and (optionally) chat with an AI assistant that can answer questions about flights/bookings.
- **Admins** can log in, manage flights (add/update/delete), view all users, view all bookings, and see basic system statistics.

Two roles only: `user` and `admin`. (Staff and Admin are merged into a single `admin` role to keep the scope manageable — this can be split later if time allows.)

---

## 2. Core Feature Recap

### Public / Homepage (no login required)
- Flight search form (from, to, date) — the primary entry point for finding flights
- AI Chatbot widget — available to everyone, including guests, for general flight queries

### User (Passenger)
- Register / Login / Logout
- View flight details and book a flight (seat selection, passenger details)
- View booking history
- Cancel a booking
- View notifications (booking confirmation, flight delay/cancellation)
- When logged in, the chatbot can also answer questions about their own bookings

### Admin
- Login (same auth system, different role)
- Add / Update / Delete flights
- View all flights
- View all users
- View all bookings
- View basic stats (total users, total flights, total bookings, revenue)

---

## 3. Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios, Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| AI Chatbot | Google Gemini Flash API (free tier) |
| Version Control | Git + GitHub |

---

## 4. System Architecture

```
┌──────────────────────┐        ┌──────────────────────────┐
│   React Frontend      │  REST  │   Express Backend API     │
│  (client/)            │ <----> │  (server/)                │
│  - Pages               │  JSON  │  - Routes                 │
│  - Components (UI)     │        │  - Controllers            │
│  - Context (Auth)       │        │  - Models (Mongoose)      │
│  - Axios services       │        │  - Middleware (JWT, roles)│
└──────────────────────┘        └─────────────┬─────────────┘
                                                │
                                                ▼
                                       ┌─────────────────┐
                                       │   MongoDB         │
                                       │ Users / Flights /  │
                                       │ Bookings /          │
                                       │ Notifications       │
                                       └─────────────────┘

Backend also calls out to:
┌─────────────────────────────┐
│ Google Gemini Flash API        │  (only from chatbot controller)
└─────────────────────────────┘
```

This is a single backend (monolithic Express app), organized into clear modules (auth, flights, bookings, notifications, chatbot, admin) — simple enough for a university timeline, but cleanly separated so each developer's work lives in its own files/folders.

---

## 5. Project Folder Structure

```
skylink/
├── client/                          # React app
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── ui/                  # Shared design system (Phase 1)
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── Alert.jsx
│   │   │   ├── auth/                # Phase 2
│   │   │   ├── admin/                # Phase 3
│   │   │   ├── user/                  # Phase 4
│   │   │   └── chatbot/                # Phase 4 (optional)
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── FlightSearchPage.jsx
│   │   │   ├── FlightDetailsPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── UserDashboardPage.jsx
│   │   │   ├── AdminDashboardPage.jsx
│   │   │   └── ProfilePage.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── routes/
│   │   │   ├── AppRoutes.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── services/
│   │   │   └── api.js               # Axios instance
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                           # Express app
│   ├── config/
│   │   └── db.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Flight.js
│   │   ├── Booking.js
│   │   └── Notification.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── flightController.js
│   │   ├── bookingController.js
│   │   ├── notificationController.js
│   │   ├── adminController.js
│   │   └── chatbotController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── flightRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── adminRoutes.js
│   │   └── chatbotRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── utils/
│   │   └── generateBookingRef.js
│   ├── server.js
│   └── package.json
│
└── README.md
```

---

## 6. Environment Configuration

### `server/.env`
```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/skylink
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
GEMINI_API_KEY=your_gemini_api_key_here
```

### `client/.env`
```
VITE_API_URL=http://localhost:5000/api
```

> Each developer should copy `.env.example` (committed to the repo without real secrets) into their own `.env` (gitignored).

---

## 7. Database Schema (MongoDB / Mongoose Models)

### 7.1 User

```js
// server/models/User.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
```

### 7.2 Flight

```js
// server/models/Flight.js
const mongoose = require('mongoose');

const flightSchema = new mongoose.Schema(
  {
    flightNumber: { type: String, required: true, unique: true },
    airline: { type: String, required: true },
    departureAirport: { type: String, required: true },
    arrivalAirport: { type: String, required: true },
    departureTime: { type: Date, required: true },
    arrivalTime: { type: Date, required: true },
    totalSeats: { type: Number, required: true },
    availableSeats: { type: Number, required: true },
    price: { type: Number, required: true },
    status: {
      type: String,
      enum: ['Scheduled', 'Boarding', 'Delayed', 'Cancelled', 'Completed'],
      default: 'Scheduled',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Flight', flightSchema);
```

### 7.3 Booking

```js
// server/models/Booking.js
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    flight: { type: mongoose.Schema.Types.ObjectId, ref: 'Flight', required: true },
    seatNumber: { type: String, required: true },
    passengerName: { type: String, required: true },
    passengerAge: { type: Number },
    bookingReference: { type: String, required: true, unique: true },
    status: { type: String, enum: ['Pending', 'Confirmed', 'Cancelled'], default: 'Confirmed' },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Booking', bookingSchema);
```

### 7.4 Notification

```js
// server/models/Notification.js
const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
    type: {
      type: String,
      enum: ['booking_confirmation', 'booking_cancellation', 'flight_delay', 'flight_cancellation'],
      required: true,
    },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
```

### 7.5 Relationships Diagram

```
User (1) ───── (many) Booking ───── (1) Flight
User (1) ───── (many) Notification
```

---

## 8. Complete API Endpoint Reference

> Base URL: `/api`

### Auth (`/api/auth`) — Phase 2
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | Public | Register a new user (role defaults to `user`) |
| POST | `/auth/login` | Public | Login, returns JWT + user info |
| GET | `/auth/me` | Authenticated | Get current logged-in user's profile |
| PUT | `/auth/profile` | Authenticated | Update profile (name, phone) |
| PUT | `/auth/change-password` | Authenticated | Change password |

### Flights (`/api/flights`) — Phase 3 (write) / Phase 4 (read)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/flights` | Public | List all flights (with pagination) |
| GET | `/flights/search` | Public | Search flights by `from`, `to`, `date` |
| GET | `/flights/:id` | Public | Get single flight details |
| POST | `/flights` | Admin | Create a flight |
| PUT | `/flights/:id` | Admin | Update a flight |
| DELETE | `/flights/:id` | Admin | Delete a flight |

### Bookings (`/api/bookings`) — Phase 4
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/bookings` | User | Create a booking (select flight + seat) |
| GET | `/bookings/my` | User | Get logged-in user's bookings |
| GET | `/bookings/:id` | User/Admin | Get a single booking |
| PUT | `/bookings/:id/cancel` | User | Cancel own booking |
| GET | `/bookings` | Admin | Get all bookings (with filters) |

### Notifications (`/api/notifications`) — Phase 5
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/notifications/my` | User | Get logged-in user's notifications |
| PUT | `/notifications/:id/read` | User | Mark a notification as read |

### Admin (`/api/admin`) — Phase 3
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/admin/users` | Admin | List all users |
| PUT | `/admin/users/:id/status` | Admin | Activate/deactivate a user |
| GET | `/admin/stats` | Admin | Get total users, flights, bookings, revenue |

### Chatbot (`/api/chatbot`) — Phase 4 (optional)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/chatbot/query` | Public (optional auth) | Send a chat message, get an AI response with flight data context. If a valid token is present, the response can also reference the user's own bookings; guests get general flight info only. |

---

## 9. Shared Design System (Phase 1 Deliverable)

Dev 1 sets up a **lightweight** style guide — just enough for visual consistency. Dev 5 will refine this later, not redesign from scratch.

### 9.1 Tailwind Theme Tokens

```js
// client/tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1E3A8A',   // deep navy blue (airline theme)
          light: '#3B82F6',
          dark: '#1E293B',
        },
        accent: '#F59E0B',      // amber for highlights/CTA
        success: '#16A34A',
        danger: '#DC2626',
        muted: '#6B7280',
      },
      borderRadius: {
        card: '0.75rem',
      },
    },
  },
  plugins: [],
};
```

### 9.2 Shared Components (placeholder implementations)

```jsx
// client/src/components/ui/Button.jsx
export default function Button({ children, variant = 'primary', ...props }) {
  const base = 'px-4 py-2 rounded-md font-medium transition-colors';
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light',
    secondary: 'bg-gray-100 text-primary hover:bg-gray-200',
    danger: 'bg-danger text-white hover:bg-red-700',
  };
  return (
    <button className={`${base} ${variants[variant]}`} {...props}>
      {children}
    </button>
  );
}
```

```jsx
// client/src/components/ui/Card.jsx
export default function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-card shadow-md p-4 ${className}`}>
      {children}
    </div>
  );
}
```

```jsx
// client/src/components/ui/Input.jsx
export default function Input({ label, error, ...props }) {
  return (
    <div className="mb-4">
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-light"
        {...props}
      />
      {error && <p className="text-danger text-sm mt-1">{error}</p>}
    </div>
  );
}
```

```jsx
// client/src/components/ui/Layout.jsx
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
```

```jsx
// client/src/components/ui/Navbar.jsx
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-primary text-white px-6 py-3 flex justify-between items-center">
      <Link to="/" className="font-bold text-lg">SkyLink</Link>
      <div className="flex gap-4">
        <Link to="/flights">Flights</Link>
        <Link to="/login">Login</Link>
      </div>
    </nav>
  );
}
```

These components are intentionally simple placeholders — every developer imports and uses them so the app looks coherent from the start. Dev 5 later refines colors/spacing/typography without changing the component API, so other pages don't break.

---

## 10. Phase-by-Phase Implementation Guide

### Phase 1 — Dev 1: Foundation, Scaffolding & Style Guide

**Tasks:**
1. Initialize the monorepo structure shown in Section 5.
2. Set up `server/`:
   - Install: `express mongoose dotenv cors bcryptjs jsonwebtoken`
   - Create `config/db.js`, `server.js`, and empty folders for `models`, `controllers`, `routes`, `middleware`, `utils`
3. Set up `client/` with Vite + React + Tailwind CSS.
4. Create the four Mongoose models (Section 7) — Dev 2–4 will extend/use these.
5. Build the shared component library (Section 9).
6. Create placeholder pages and routing (so navigation works end-to-end, even if pages are empty). For `LandingPage`, include placeholder sections for: a hero area with a flight search form, and a spot for the chatbot widget — Dev 4 will fill these in during Phase 4.
7. Set up `.env.example` files for both `client/` and `server/`.
8. Push initial commit to `main`, create `develop` branch, document branch strategy in `README.md`.

**Key code:**

```js
// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

```js
// server/server.js
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
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/flights', require('./routes/flightRoutes'));
// app.use('/api/bookings', require('./routes/bookingRoutes'));
// app.use('/api/notifications', require('./routes/notificationRoutes'));
// app.use('/api/admin', require('./routes/adminRoutes'));
// app.use('/api/chatbot', require('./routes/chatbotRoutes'));

app.use(require('./middleware/errorMiddleware'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
```

```js
// server/middleware/errorMiddleware.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({ message: err.message || 'Server Error' });
};
```

```js
// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach token automatically if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
```

**Handoff checklist (must be true before Phase 2 starts):**
- [ ] `npm run dev` works for both `client/` and `server/`
- [ ] `/api/health` returns `{ status: 'ok' }`
- [ ] MongoDB connects successfully (using a shared dev cluster or local Mongo)
- [ ] All placeholder pages are reachable via the navbar/routes
- [ ] Shared UI components exist in `components/ui/` and are documented in `README.md`
- [ ] Branch strategy (`main`, `develop`, `feature/*`) is documented

---

### Phase 2 — Dev 2: Authentication & Authorization

**Tasks:**
1. Build `authController.js`: `register`, `login`, `getMe`, `updateProfile`, `changePassword`.
2. Build `authMiddleware.js`: `protect` (verifies JWT) and `isAdmin` (checks role).
3. Build `authRoutes.js` and mount it in `server.js`.
4. Frontend: `LoginPage`, `RegisterPage`, `AuthContext`, `ProtectedRoute`.
5. On successful login, store JWT + user info (in `localStorage` or context), redirect based on role (`user` → `/dashboard`, `admin` → `/admin`).

**Key code:**

```js
// server/controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body;

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already registered' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, phone });

    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isActive) return res.status(403).json({ message: 'Account is deactivated' });

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};
```

```js
// server/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) return res.status(401).json({ message: 'User not found' });
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

exports.isAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Used by routes that should work for guests AND logged-in users
// (e.g. the chatbot). Never blocks the request — just attaches
// req.user if a valid token is present, otherwise req.user = null.
exports.optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
  } catch (err) {
    req.user = null;
  }
  next();
};
```

```js
// server/routes/authRoutes.js
const express = require('express');
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', protect, getMe);

module.exports = router;
```

```jsx
// client/src/context/AuthContext.jsx
import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
```

```jsx
// client/src/routes/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}
```

**Handoff checklist:**
- [ ] `/api/auth/register` and `/api/auth/login` work and return a JWT
- [ ] Login page redirects `user` → `/dashboard`, `admin` → `/admin`
- [ ] Protected routes block access for unauthenticated users and wrong roles
- [ ] `protect` and `isAdmin` middleware exported and ready for Dev 3/4 to use

---

### Phase 3 — Dev 3: Admin Dashboard (Flight, User & Booking Management)

**Tasks:**
1. Build `flightController.js`: `getFlights`, `searchFlights`, `getFlightById`, `createFlight`, `updateFlight`, `deleteFlight`.
2. Build `flightRoutes.js`, protect write routes with `protect` + `isAdmin`.
3. Build `adminController.js`: `getAllUsers`, `updateUserStatus`, `getStats`.
4. Build `adminRoutes.js`, all protected by `protect` + `isAdmin`.
5. Frontend: `AdminDashboardPage` with:
   - Flight management table (add/edit/delete via modal forms)
   - Users table (list + activate/deactivate)
   - Bookings overview table
   - Summary cards (total users, flights, bookings, revenue)

**Key code:**

```js
// server/controllers/flightController.js
const Flight = require('../models/Flight');

exports.getFlights = async (req, res, next) => {
  try {
    const flights = await Flight.find().sort({ departureTime: 1 });
    res.json(flights);
  } catch (err) {
    next(err);
  }
};

exports.searchFlights = async (req, res, next) => {
  try {
    const { from, to, date } = req.query;
    const query = {};
    if (from) query.departureAirport = new RegExp(from, 'i');
    if (to) query.arrivalAirport = new RegExp(to, 'i');
    if (date) {
      const start = new Date(date);
      const end = new Date(date);
      end.setDate(end.getDate() + 1);
      query.departureTime = { $gte: start, $lt: end };
    }
    const flights = await Flight.find(query);
    res.json(flights);
  } catch (err) {
    next(err);
  }
};

exports.getFlightById = async (req, res, next) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

exports.createFlight = async (req, res, next) => {
  try {
    const flight = await Flight.create({
      ...req.body,
      availableSeats: req.body.totalSeats,
    });
    res.status(201).json(flight);
  } catch (err) {
    next(err);
  }
};

exports.updateFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json(flight);
  } catch (err) {
    next(err);
  }
};

exports.deleteFlight = async (req, res, next) => {
  try {
    const flight = await Flight.findByIdAndDelete(req.params.id);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    res.json({ message: 'Flight deleted' });
  } catch (err) {
    next(err);
  }
};
```

```js
// server/routes/flightRoutes.js
const express = require('express');
const {
  getFlights, searchFlights, getFlightById, createFlight, updateFlight, deleteFlight,
} = require('../controllers/flightController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getFlights);
router.get('/search', searchFlights);
router.get('/:id', getFlightById);
router.post('/', protect, isAdmin, createFlight);
router.put('/:id', protect, isAdmin, updateFlight);
router.delete('/:id', protect, isAdmin, deleteFlight);

module.exports = router;
```

```js
// server/controllers/adminController.js
const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    next(err);
  }
};

exports.updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive: req.body.isActive },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    next(err);
  }
};

exports.getStats = async (req, res, next) => {
  try {
    const [totalUsers, totalFlights, totalBookings, bookings] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Flight.countDocuments(),
      Booking.countDocuments(),
      Booking.find({ status: 'Confirmed' }),
    ]);
    const revenue = bookings.reduce((sum, b) => sum + b.totalPrice, 0);

    res.json({ totalUsers, totalFlights, totalBookings, revenue });
  } catch (err) {
    next(err);
  }
};
```

**Handoff checklist:**
- [ ] Admin can create/edit/delete flights from the dashboard, reflected immediately in flight list
- [ ] Admin can view all users and activate/deactivate them
- [ ] Stats endpoint returns correct counts
- [ ] All admin endpoints reject non-admin tokens with `403`

---

### Phase 4 — Dev 4: User Dashboard, Booking & AI Chatbot

**Tasks:**
1. Build `bookingController.js`: `createBooking`, `getMyBookings`, `getBookingById`, `cancelBooking`, `getAllBookings` (admin, used by Dev 3's dashboard too).
2. Build `bookingRoutes.js`.
3. Build `utils/generateBookingRef.js`.
4. Frontend — **homepage-first flight search**:
   - `LandingPage`: hero section with a flight search form (from, to, date). On submit, navigate to `FlightSearchPage` with the search params in the URL (e.g. `/flights?from=...&to=...&date=...`), which calls `GET /api/flights/search` and displays results as cards.
   - `FlightSearchPage`: shows search results, links each result to `FlightDetailsPage`.
   - `BookingPage`: seat selection + passenger details, calls `POST /api/bookings` (requires login — redirect to `/login` if not authenticated).
   - `UserDashboardPage`: upcoming flights (from the user's confirmed bookings) and recent bookings/history. **No search bar or filters here** — search lives on the homepage only.
5. **AI Chatbot** (homepage only, available to guests and logged-in users):
   - `chatbotController.js`: receives a user message, fetches relevant flight data from MongoDB, and — if the request is authenticated — also includes the user's own bookings as context. Sends context + message to Gemini Flash API, returns the reply.
   - Frontend: `ChatWidget` rendered **only on `LandingPage`** (not in a global layout, not in the dashboard). Works the same whether the visitor is logged in or not — the backend just returns more personalized answers if a token is present.

**Key code:**

```js
// server/utils/generateBookingRef.js
exports.generateBookingRef = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let ref = '';
  for (let i = 0; i < 6; i++) {
    ref += chars[Math.floor(Math.random() * chars.length)];
  }
  return `SKY-${ref}`;
};
```

```js
// server/controllers/bookingController.js
const Booking = require('../models/Booking');
const Flight = require('../models/Flight');
const Notification = require('../models/Notification');
const { generateBookingRef } = require('../utils/generateBookingRef');

exports.createBooking = async (req, res, next) => {
  try {
    const { flightId, seatNumber, passengerName, passengerAge } = req.body;

    const flight = await Flight.findById(flightId);
    if (!flight) return res.status(404).json({ message: 'Flight not found' });
    if (flight.availableSeats <= 0) return res.status(400).json({ message: 'No seats available' });

    const booking = await Booking.create({
      user: req.user.id,
      flight: flight._id,
      seatNumber,
      passengerName,
      passengerAge,
      bookingReference: generateBookingRef(),
      totalPrice: flight.price,
    });

    flight.availableSeats -= 1;
    await flight.save();

    await Notification.create({
      user: req.user.id,
      message: `Your booking ${booking.bookingReference} for flight ${flight.flightNumber} is confirmed.`,
      type: 'booking_confirmation',
    });

    res.status(201).json(booking);
  } catch (err) {
    next(err);
  }
};

exports.getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).populate('flight');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};

exports.getBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id).populate('flight');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    const isOwner = booking.user.toString() === req.user.id;
    if (!isOwner && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }
    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    booking.status = 'Cancelled';
    await booking.save();

    const flight = await Flight.findById(booking.flight);
    if (flight) {
      flight.availableSeats += 1;
      await flight.save();
    }

    await Notification.create({
      user: req.user.id,
      message: `Your booking ${booking.bookingReference} has been cancelled.`,
      type: 'booking_cancellation',
    });

    res.json(booking);
  } catch (err) {
    next(err);
  }
};

exports.getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find().populate('user', 'name email').populate('flight');
    res.json(bookings);
  } catch (err) {
    next(err);
  }
};
```

```js
// server/routes/bookingRoutes.js
const express = require('express');
const {
  createBooking, getMyBookings, getBookingById, cancelBooking, getAllBookings,
} = require('../controllers/bookingController');
const { protect, isAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, createBooking);
router.get('/my', protect, getMyBookings);
router.get('/:id', protect, getBookingById);
router.put('/:id/cancel', protect, cancelBooking);
router.get('/', protect, isAdmin, getAllBookings);

module.exports = router;
```

#### Optional: AI Chatbot (Gemini Flash API)

The chatbot's job is narrow: answer flight/booking questions using live data from MongoDB. A simple, reliable approach for a university project is **"retrieve then ask"**: pull relevant flights/bookings from MongoDB based on the user's message, then pass that data to Gemini as context so it can answer in natural language.

```js
// server/controllers/chatbotController.js
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');

exports.handleChatQuery = async (req, res, next) => {
  try {
    const { message } = req.body;

    // 1. Pull some relevant context from the DB.
    //    Available to everyone: upcoming flights.
    //    Only if logged in: the user's own bookings.
    const upcomingFlights = await Flight.find({ departureTime: { $gte: new Date() } })
      .limit(10)
      .lean();

    let myBookings = [];
    if (req.user) {
      myBookings = await Booking.find({ user: req.user.id })
        .populate('flight')
        .lean();
    }

    const context = {
      upcomingFlights: upcomingFlights.map((f) => ({
        flightNumber: f.flightNumber,
        from: f.departureAirport,
        to: f.arrivalAirport,
        departureTime: f.departureTime,
        status: f.status,
        availableSeats: f.availableSeats,
        price: f.price,
      })),
      myBookings: myBookings.map((b) => ({
        reference: b.bookingReference,
        flightNumber: b.flight?.flightNumber,
        status: b.status,
        seat: b.seatNumber,
      })),
      isLoggedIn: !!req.user,
    };

    // 2. Ask Gemini Flash, giving it the context + the user's question.
    const prompt = `
You are a helpful assistant for the SkyLink Flight Management System.
Use ONLY the data below to answer the user's question. If the answer
isn't in the data, say you don't have that information.

If "isLoggedIn" is false, "myBookings" will be empty — in that case,
if the user asks about "my booking", politely tell them to log in
to check their booking status.

DATA:
${JSON.stringify(context)}

USER QUESTION:
${message}
    `.trim();

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const data = await response.json();
    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text
      || "Sorry, I couldn't process that right now.";

    res.json({ reply });
  } catch (err) {
    next(err);
  }
};
```

```js
// server/routes/chatbotRoutes.js
const express = require('express');
const { handleChatQuery } = require('../controllers/chatbotController');
const { optionalAuth } = require('../middleware/authMiddleware');

const router = express.Router();
router.post('/query', optionalAuth, handleChatQuery);

module.exports = router;
```

```jsx
// client/src/components/chatbot/ChatWidget.jsx
// Rendered ONLY on LandingPage. Works for guests and logged-in users —
// the axios instance (services/api.js) automatically attaches a token
// if one exists in localStorage, but sends no Authorization header
// for guests, which the backend's optionalAuth middleware handles.
import { useState } from 'react';
import api from '../../services/api';
import Button from '../ui/Button';

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userMsg = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chatbot/query', { message: userMsg.text });
      setMessages((prev) => [...prev, { role: 'bot', text: data.reply }]);
    } catch {
      setMessages((prev) => [...prev, { role: 'bot', text: 'Something went wrong.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 shadow-lg"
      >
        💬
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white rounded-card shadow-xl flex flex-col">
      <div className="bg-primary text-white px-4 py-2 rounded-t-card flex justify-between">
        <span>SkyLink Assistant</span>
        <button onClick={() => setOpen(false)}>✕</button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'text-right' : 'text-left'}>
            <span className={`inline-block px-3 py-1 rounded-md ${m.role === 'user' ? 'bg-primary-light text-white' : 'bg-gray-100'}`}>
              {m.text}
            </span>
          </div>
        ))}
        {loading && <p className="text-muted text-xs">Thinking...</p>}
      </div>
      <div className="p-2 border-t flex gap-2">
        <input
          className="flex-1 border rounded-md px-2 py-1 text-sm"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Ask about flights..."
        />
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}
```

> **Note:** Verify the exact Gemini Flash model name and endpoint against the current [Google AI Studio / Gemini API docs](https://ai.google.dev/) before finalizing — model names (e.g. `gemini-1.5-flash` vs newer versions) are updated periodically by Google.

**Handoff checklist:**
- [ ] Homepage hero search form works and navigates to `FlightSearchPage` with correct results
- [ ] User can view flight details and complete a booking with seat selection (login required, redirects to `/login` if not authenticated)
- [ ] `availableSeats` decreases on booking and increases on cancellation
- [ ] User dashboard shows upcoming flights and recent bookings, with **no search bar/filters** there
- [ ] Chatbot widget appears on the homepage only, and works for both guests and logged-in users (guests get general flight info; logged-in users can also ask about their own bookings)

---

### Phase 5 — Dev 5: Notifications, UI/UX Polish & Final Integration

**Tasks:**
1. Build `notificationController.js` and `notificationRoutes.js`.
2. Frontend: notification bell/panel showing unread notifications, mark-as-read.
3. **UI/UX polish pass** across all pages:
   - Refine Tailwind theme tokens (colors, spacing, font choices) from Section 9.1
   - Improve responsiveness (mobile nav, table → card layouts on small screens)
   - Add consistent loading/empty/error states using `LoadingSpinner` and `Alert`
   - Polish landing page, login/register forms, dashboards
4. Final integration testing (Section 12) across the whole app.
5. Prepare for deployment (Section 13).

**Key code:**

```js
// server/controllers/notificationController.js
const Notification = require('../models/Notification');

exports.getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (err) {
    next(err);
  }
};

exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (err) {
    next(err);
  }
};
```

```js
// server/routes/notificationRoutes.js
const express = require('express');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();
router.get('/my', protect, getMyNotifications);
router.put('/:id/read', protect, markAsRead);

module.exports = router;
```

**Handoff checklist:**
- [ ] Notifications are created automatically on booking/cancellation (already wired by Dev 4) and visible/markable in the UI
- [ ] All pages are responsive (mobile, tablet, desktop)
- [ ] Visual style is consistent across landing, auth, user, and admin pages
- [ ] Full user journey (register → login → search → book → cancel → notification) works without errors
- [ ] Full admin journey (login → manage flights → view users/bookings/stats) works without errors

---

## 11. Git Workflow & Collaboration

- **Branches:** `main` (stable), `develop` (integration), `feature/phase-1-foundation`, `feature/phase-2-auth`, `feature/phase-3-admin`, `feature/phase-4-user-booking`, `feature/phase-5-polish`
- **Sequential flow:**
  1. Developer pulls latest `develop`
  2. Creates their `feature/phase-X-*` branch
  3. Completes their phase, following the checklist above
  4. Opens a Pull Request into `develop`
  5. At least one other team member reviews/approves
  6. Merge into `develop`, confirm app still runs end-to-end
  7. Next developer starts their phase from the updated `develop`
- Periodically merge `develop` → `main` as stable checkpoints (e.g., after each phase).
- Commit messages should be descriptive (e.g., `feat(auth): add JWT login and protected routes`) — this matters for individual contribution evaluation.

---

## 12. Testing Checklist (Final, Phase 5)

**Authentication**
- [ ] Register with duplicate email is rejected
- [ ] Login with wrong password is rejected
- [ ] JWT expires/invalid token is rejected on protected routes
- [ ] Role-based redirects work correctly

**Flights**
- [ ] Search returns correct results for route/date combinations
- [ ] Admin-only flight CRUD endpoints reject non-admins

**Bookings**
- [ ] Booking decreases `availableSeats`; cancellation restores it
- [ ] Booking reference is unique
- [ ] Users cannot view/cancel another user's booking

**Notifications**
- [ ] Notifications created on booking/cancellation
- [ ] Mark-as-read works and persists

**Admin**
- [ ] Stats reflect real counts after creating test data
- [ ] User activation/deactivation affects login (deactivated user can't log in)

**Chatbot (if implemented)**
- [ ] Handles basic flight/booking queries correctly
- [ ] Gracefully handles API errors (e.g., missing/invalid Gemini key)

---

## 13. Deployment Notes (Optional, for demo purposes)

- **Database:** MongoDB Atlas (free tier) — shared connection string for the team
- **Backend:** Render / Railway (free tier) — deploy `server/`
- **Frontend:** Vercel / Netlify — deploy `client/`, set `VITE_API_URL` to the deployed backend URL
- Make sure `CLIENT_URL` in the backend `.env` matches the deployed frontend URL (for CORS)
- Set all environment variables (`MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.) in the hosting provider's dashboard — never commit real secrets

---

## 14. Summary Table — Who Owns What

| Phase | Developer | Owns | Key Files |
|---|---|---|---|
| 1 | Dev 1 | Project setup, models skeleton, routing skeleton, shared UI components | `server.js`, `config/db.js`, `models/*`, `components/ui/*` |
| 2 | Dev 2 | Authentication & Authorization | `authController.js`, `authMiddleware.js`, `AuthContext.jsx`, `ProtectedRoute.jsx` |
| 3 | Dev 3 | Admin Dashboard (flights, users, bookings overview, stats) | `flightController.js`, `adminController.js`, `AdminDashboardPage.jsx` |
| 4 | Dev 4 | User Dashboard, Booking flow, AI Chatbot (optional) | `bookingController.js`, `chatbotController.js`, `BookingPage.jsx`, `ChatWidget.jsx` |
| 5 | Dev 5 | Notifications, UI/UX polish, final integration & testing | `notificationController.js`, Tailwind theme refinements, all page polish |

---

*This document should be kept up to date as the project evolves — if a developer changes a model field, API contract, or component prop signature, update this file so downstream developers aren't blocked by outdated information.*
