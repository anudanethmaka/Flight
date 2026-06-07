using Microsoft.EntityFrameworkCore;
using SkyLink.FlightService.Models;

namespace SkyLink.FlightService.Data
{
    public class FlightDbContext : DbContext
    {
        public FlightDbContext(DbContextOptions<FlightDbContext> options) : base(options)
        {
        }

        public DbSet<Flight> Flights { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure Price column decimal precision
            modelBuilder.Entity<Flight>()
                .Property(f => f.Price)
                .HasPrecision(18, 2);

            // Seed Sample Flights
            modelBuilder.Entity<Flight>().HasData(
                new Flight
                {
                    Id = 1,
                    FlightNumber = "SL-101",
                    DepartureAirport = "CMB (Colombo)",
                    ArrivalAirport = "SIN (Singapore)",
                    DepartureDate = DateTime.Today.AddDays(1),
                    DepartureTime = "07:30",
                    ArrivalTime = "13:50",
                    TotalSeats = 180,
                    AvailableSeats = 178,
                    Price = 350.00m,
                    FlightStatus = "Scheduled"
                },
                new Flight
                {
                    Id = 2,
                    FlightNumber = "SL-202",
                    DepartureAirport = "CMB (Colombo)",
                    ArrivalAirport = "LHR (London)",
                    DepartureDate = DateTime.Today.AddDays(2),
                    DepartureTime = "12:15",
                    ArrivalTime = "19:30",
                    TotalSeats = 250,
                    AvailableSeats = 245,
                    Price = 780.00m,
                    FlightStatus = "Scheduled"
                },
                new Flight
                {
                    Id = 3,
                    FlightNumber = "SL-303",
                    DepartureAirport = "JFK (New York)",
                    ArrivalAirport = "LHR (London)",
                    DepartureDate = DateTime.Today,
                    DepartureTime = "21:00",
                    ArrivalTime = "09:00",
                    TotalSeats = 300,
                    AvailableSeats = 290,
                    Price = 620.00m,
                    FlightStatus = "Delayed"
                },
                new Flight
                {
                    Id = 4,
                    FlightNumber = "SL-404",
                    DepartureAirport = "SIN (Singapore)",
                    ArrivalAirport = "HND (Tokyo)",
                    DepartureDate = DateTime.Today.AddDays(3),
                    DepartureTime = "23:55",
                    ArrivalTime = "07:45",
                    TotalSeats = 200,
                    AvailableSeats = 200,
                    Price = 450.00m,
                    FlightStatus = "Scheduled"
                }
            );
        }
    }
}
