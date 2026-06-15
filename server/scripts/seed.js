const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
const User = require('../models/User');
const Flight = require('../models/Flight');
const Booking = require('../models/Booking');
const Notification = require('../models/Notification');

// Load environment variables from server/.env
dotenv.config();

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected. Clearing database...');

    // Clear existing data
    await User.deleteMany({});
    await Flight.deleteMany({});
    await Booking.deleteMany({});
    await Notification.deleteMany({});

    console.log('Database cleared. Seeding users...');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('password123', 10);

    // Create users
    const adminUser = await User.create({
      name: 'SkyLink Administrator',
      email: 'admin@skylink.com',
      password: adminPassword,
      phone: '+1 (555) 019-2834',
      role: 'admin',
      isActive: true,
    });

    const activeUser1 = await User.create({
      name: 'John Doe',
      email: 'user1@skylink.com',
      password: userPassword,
      phone: '+1 (555) 014-9988',
      role: 'user',
      isActive: true,
    });

    const activeUser2 = await User.create({
      name: 'Jane Smith',
      email: 'user2@skylink.com',
      password: userPassword,
      phone: '+1 (555) 018-7744',
      role: 'user',
      isActive: true,
    });

    const deactivatedUser = await User.create({
      name: 'Deactivated Passenger',
      email: 'deactivated@skylink.com',
      password: userPassword,
      phone: '+1 (555) 011-2233',
      role: 'user',
      isActive: false,
    });

    console.log('Seeding flights...');

    const today = new Date();
    
    // Flight 1: Scheduled
    const flight1 = await Flight.create({
      flightNumber: 'SKY-101',
      airline: 'SkyLink Airlines',
      departureAirport: 'Colombo (CMB)',
      arrivalAirport: 'London Heathrow (LHR)',
      departureTime: new Date(today.getTime() + 24 * 60 * 60 * 1000), // tomorrow
      arrivalTime: new Date(today.getTime() + 34 * 60 * 60 * 1000),
      totalSeats: 150,
      availableSeats: 149, // 1 booked
      price: 650,
      status: 'Scheduled',
    });

    // Flight 2: Boarding
    const flight2 = await Flight.create({
      flightNumber: 'SKY-202',
      airline: 'SkyLink Emirates',
      departureAirport: 'Colombo (CMB)',
      arrivalAirport: 'Dubai International (DXB)',
      departureTime: new Date(today.getTime() + 2 * 60 * 60 * 1000), // in 2 hours
      arrivalTime: new Date(today.getTime() + 6 * 60 * 60 * 1000),
      totalSeats: 120,
      availableSeats: 119, // 1 booked
      price: 320,
      status: 'Boarding',
    });

    // Flight 3: Delayed
    const flight3 = await Flight.create({
      flightNumber: 'SKY-303',
      airline: 'SkyLink Express',
      departureAirport: 'Colombo (CMB)',
      arrivalAirport: 'John F. Kennedy (JFK)',
      departureTime: new Date(today.getTime() + 12 * 60 * 60 * 1000), // in 12 hours
      arrivalTime: new Date(today.getTime() + 28 * 60 * 60 * 1000),
      totalSeats: 200,
      availableSeats: 199, // 1 booked
      price: 980,
      status: 'Delayed',
    });

    // Flight 4: Cancelled
    const flight4 = await Flight.create({
      flightNumber: 'SKY-404',
      airline: 'SkyLink Asia',
      departureAirport: 'Colombo (CMB)',
      arrivalAirport: 'Changi Singapore (SIN)',
      departureTime: new Date(today.getTime() + 6 * 60 * 60 * 1000),
      arrivalTime: new Date(today.getTime() + 10 * 60 * 60 * 1000),
      totalSeats: 100,
      availableSeats: 100,
      price: 210,
      status: 'Cancelled',
    });

    // Flight 5: Completed
    const flight5 = await Flight.create({
      flightNumber: 'SKY-505',
      airline: 'SkyLink Pacific',
      departureAirport: 'Colombo (CMB)',
      arrivalAirport: 'Tokyo Haneda (HND)',
      departureTime: new Date(today.getTime() - 48 * 60 * 60 * 1000), // 2 days ago
      arrivalTime: new Date(today.getTime() - 38 * 60 * 60 * 1000),
      totalSeats: 180,
      availableSeats: 180,
      price: 750,
      status: 'Completed',
    });

    console.log('Seeding bookings...');

    // Booking 1: User 1 on Flight 1 (LHR)
    await Booking.create({
      user: activeUser1._id,
      flight: flight1._id,
      seatNumber: '12A',
      passengerName: 'John Doe',
      passengerAge: 32,
      bookingReference: 'SKY-CONF12',
      status: 'Confirmed',
      totalPrice: flight1.price,
    });

    // Booking 2: User 1 on Flight 3 (JFK)
    await Booking.create({
      user: activeUser1._id,
      flight: flight3._id,
      seatNumber: '14C',
      passengerName: 'John Doe',
      passengerAge: 32,
      bookingReference: 'SKY-CONF34',
      status: 'Confirmed',
      totalPrice: flight3.price,
    });

    // Booking 3: User 2 on Flight 2 (DXB)
    await Booking.create({
      user: activeUser2._id,
      flight: flight2._id,
      seatNumber: '10F',
      passengerName: 'Jane Smith',
      passengerAge: 28,
      bookingReference: 'SKY-CONF56',
      status: 'Confirmed',
      totalPrice: flight2.price,
    });

    console.log('Seeding notifications...');

    await Notification.create({
      user: activeUser1._id,
      message: 'Your booking (SKY-CONF12) for flight SKY-101 is confirmed.',
      type: 'booking_confirmation',
      isRead: false,
    });

    await Notification.create({
      user: activeUser1._id,
      message: 'Flight SKY-303 is currently delayed by 2 hours due to weather conditions.',
      type: 'flight_delay',
      isRead: false,
    });

    await Notification.create({
      user: activeUser2._id,
      message: 'Your booking (SKY-CONF56) for flight SKY-202 is confirmed.',
      type: 'booking_confirmation',
      isRead: true,
    });

    console.log('Database seeded successfully! 🎉');
    console.log('Admin account: admin@skylink.com / admin123');
    console.log('User account: user1@skylink.com / password123');
    console.log('User account: user2@skylink.com / password123');
    console.log('Deactivated user: deactivated@skylink.com / password123');
    
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  }
};

seedDatabase();
