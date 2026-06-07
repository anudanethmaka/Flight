using Microsoft.EntityFrameworkCore;
using SkyLink.FlightService.Data;
using SkyLink.FlightService.Models;

namespace SkyLink.FlightService.Repositories
{
    public class FlightRepository : IFlightRepository
    {
        private readonly FlightDbContext _context;

        public FlightRepository(FlightDbContext context)
        {
            _context = context;
        }

        public async Task<Flight?> GetByIdAsync(int id)
        {
            return await _context.Flights.FindAsync(id);
        }

        public async Task<IEnumerable<Flight>> GetAllAsync()
        {
            return await _context.Flights.ToListAsync();
        }

        public async Task<IEnumerable<Flight>> SearchAsync(string? departure, string? arrival, DateTime? date)
        {
            var query = _context.Flights.AsQueryable();

            if (!string.IsNullOrEmpty(departure))
            {
                var dep = departure.Trim().ToLower();
                query = query.Where(f => f.DepartureAirport.ToLower().Contains(dep));
            }

            if (!string.IsNullOrEmpty(arrival))
            {
                var arr = arrival.Trim().ToLower();
                query = query.Where(f => f.ArrivalAirport.ToLower().Contains(arr));
            }

            if (date.HasValue)
            {
                var targetDate = date.Value.Date;
                query = query.Where(f => f.DepartureDate.Date == targetDate);
            }

            return await query.ToListAsync();
        }

        public async Task CreateAsync(Flight flight)
        {
            await _context.Flights.AddAsync(flight);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Flight flight)
        {
            _context.Flights.Update(flight);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Flight flight)
        {
            _context.Flights.Remove(flight);
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetCountAsync()
        {
            return await _context.Flights.CountAsync();
        }
    }
}
