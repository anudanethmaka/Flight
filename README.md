# SkyLink Flight Management System ✈️

A full-stack web application for flight booking and management, built with React, Express, and MongoDB.

## Features

- **Passengers**: Search flights, book tickets with seat selection, view booking history, cancel bookings, receive notifications
- **Admins**: Manage flights (add/update/delete), view all users and bookings, see system statistics
- **AI Chatbot**: Gemini-powered assistant for flight and booking queries (optional)

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React.js (Vite), React Router, Axios, Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JWT (jsonwebtoken) + bcrypt |
| AI Chatbot | Google Gemini Flash API (optional) |

## Project Structure

```
skylink/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/ui/   # Shared UI component library
│   │   ├── pages/           # Page components
│   │   ├── context/         # React contexts (Auth)
│   │   ├── routes/          # Routing configuration
│   │   └── services/        # API service (Axios)
│   └── package.json
│
├── server/                  # Express backend
│   ├── config/              # Database config
│   ├── models/              # Mongoose models
│   ├── controllers/         # Route handlers
│   ├── routes/              # Express routes
│   ├── middleware/          # Auth & error middleware
│   ├── utils/               # Utility functions
│   └── package.json
│
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas cluster)
- Git

### Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd skylink
   ```

2. **Set up the server**
   ```bash
   cd server
   cp .env.example .env
   # Edit .env with your MongoDB URI and JWT secret
   npm install
   npm run dev
   ```

3. **Set up the client** (in a new terminal)
   ```bash
   cd client
   cp .env.example .env
   npm install
   npm run dev
   ```

4. **Verify**
   - Backend health check: http://localhost:5000/api/health
   - Frontend: http://localhost:5173

## Environment Variables

### Server (`server/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g., `7d`) |
| `CLIENT_URL` | Frontend URL for CORS (e.g., `http://localhost:5173`) |
| `GEMINI_API_KEY` | Google Gemini API key (optional, for chatbot) |

### Client (`client/.env`)
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g., `http://localhost:5000/api`) |

## Shared UI Components

The following shared components are available in `client/src/components/ui/`:

| Component | Usage |
|---|---|
| `Button` | `<Button variant="primary\|secondary\|danger\|accent">` |
| `Card` | `<Card className="...">` |
| `Input` | `<Input label="..." error="..." />` |
| `Layout` | Page wrapper with Navbar |
| `Navbar` | Navigation bar (auto-included in Layout) |
| `LoadingSpinner` | `<LoadingSpinner size="sm\|md\|lg" />` |
| `Alert` | `<Alert type="info\|success\|warning\|error">` |

## Git Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Stable, production-ready code |
| `develop` | Integration branch for all features |
| `feature/phase-1-foundation` | Project setup, models, shared UI (Dev 1) |
| `feature/phase-2-auth` | Authentication & authorization (Dev 2) |
| `feature/phase-3-admin` | Admin dashboard & flight management (Dev 3) |
| `feature/phase-4-user-booking` | User dashboard, booking & chatbot (Dev 4) |
| `feature/phase-5-polish` | Notifications, UI polish & testing (Dev 5) |

### Workflow

1. Pull latest `develop`
2. Create your `feature/phase-X-*` branch from `develop`
3. Complete your phase following the implementation plan
4. Open a Pull Request into `develop`
5. Get at least one team member to review/approve
6. Merge into `develop`, verify the app runs end-to-end
7. Periodically merge `develop` → `main` as stable checkpoints

### Commit Message Convention

Use descriptive commit messages:
```
feat(auth): add JWT login and protected routes
fix(flights): correct search query date filtering
style(ui): update card shadows and spacing
```

## Development Phases

| Phase | Developer | Focus |
|---|---|---|
| 1 | Dev 1 | Foundation, scaffolding, shared UI components |
| 2 | Dev 2 | Authentication & authorization |
| 3 | Dev 3 | Admin dashboard (flights, users, bookings, stats) |
| 4 | Dev 4 | User dashboard, booking flow, AI chatbot |
| 5 | Dev 5 | Notifications, UI/UX polish, final integration |

## License

This project is part of a university coursework assignment.
