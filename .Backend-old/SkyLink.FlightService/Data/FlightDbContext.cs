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

            // Generate Random Flights
            var airports = new[] { "LHR (London)", "JFK (New York)", "SIN (Singapore)", "DXB (Dubai)", "SYD (Sydney)", "NRT (Tokyo)", "CDG (Paris)", "FRA (Frankfurt)", "LAX (Los Angeles)", "CMB (Colombo)" };
            var statuses = new[] { "Scheduled", "Scheduled", "Scheduled", "Scheduled", "Scheduled", "Delayed", "Boarding" };
            
            var flights = new List<Flight>();
            var random = new Random(12345); // deterministic seed so migrations don't constantly change

            for (int i = 1; i <= 300; i++)
            {
                var depIdx = random.Next(airports.Length);
                int arrIdx;
                do { arrIdx = random.Next(airports.Length); } while (arrIdx == depIdx);

                var depDate = DateTime.Today.AddDays(random.Next(0, 30));
                
                int totalSeats = random.Next(150, 350);
                int availableSeats = random.Next(0, totalSeats);

                flights.Add(new Flight
                {
                    Id = i,
                    FlightNumber = $"SL-{random.Next(100, 999)}",
                    DepartureAirport = airports[depIdx],
                    ArrivalAirport = airports[arrIdx],
                    DepartureDate = depDate,
                    DepartureTime = $"{random.Next(0, 24):D2}:{random.Next(0, 60):D2}",
                    ArrivalTime = $"{random.Next(0, 24):D2}:{random.Next(0, 60):D2}",
                    TotalSeats = totalSeats,
                    AvailableSeats = availableSeats,
                    Price = Math.Round((decimal)(random.NextDouble() * 1050 + 150), 2),
                    FlightStatus = statuses[random.Next(statuses.Length)]
                });
            }

            modelBuilder.Entity<Flight>().HasData(flights);
        }
    }
}
