export type Role = 'Passenger' | 'Staff' | 'Administrator';

export interface JwtPayload {
  userId: string;
  username: string;
  role: Role;
}

// Global Express request augmentation for TS
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// Auth Service DTOs
export interface RegisterDto {
  username: string;
  email: string;
  password?: string;
  fullName: string;
}

export interface LoginDto {
  username: string;
  password?: string;
}

export interface AuthResponseDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  token: string;
}

export interface UserProfileDto {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt: string | Date;
}

export interface UpdateProfileDto {
  fullName: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword?: string;
  newPassword?: string;
}

export interface CreateStaffDto {
  username: string;
  email: string;
  password?: string;
  fullName: string;
}

// Flight Service DTOs
export interface CreateFlightDto {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string | Date;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  price: number;
}

export interface UpdateFlightDto {
  flightNumber: string;
  departureAirport: string;
  arrivalAirport: string;
  departureDate: string | Date;
  departureTime: string;
  arrivalTime: string;
  totalSeats: number;
  price: number;
  flightStatus: 'Scheduled' | 'Delayed' | 'Cancelled';
}

// Booking Service DTOs
export interface PassengerTicketDto {
  passengerName: string;
  seatNumber: string;
}

export interface CreateBookingDto {
  flightId: string;
  passengers: PassengerTicketDto[];
}

export interface TicketDetailsDto {
  id: string;
  ticketNumber: string;
  passengerName: string;
  seatNumber: string;
}

export interface BookingDetailsDto {
  id: string;
  bookingReference: string;
  userId: string;
  flightId: string;
  bookingDate: string | Date;
  status: 'Confirmed' | 'Cancelled';
  totalPrice: number;
  tickets: TicketDetailsDto[];
}

export interface BookingPassengerDto {
  userId: string;
  bookingReference: string;
}

// Notification Service DTOs
export interface SendNotificationDto {
  userId: string;
  message: string;
  type: 'BookingConfirmation' | 'FlightUpdate' | 'Cancellation';
}

export interface FlightUpdateNotificationDto {
  flightId: string;
  flightNumber: string;
  status: 'Delayed' | 'Cancelled';
  message: string;
}
