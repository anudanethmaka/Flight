using SkyLink.FlightService.Models;

namespace SkyLink.FlightService.Repositories
{
    public interface IFlightRepository
    {
        Task<Flight?> GetByIdAsync(int id);
        Task<IEnumerable<Flight>> GetAllAsync();
        Task<IEnumerable<Flight>> SearchAsync(string? departure, string? arrival, DateTime? date);
        Task CreateAsync(Flight flight);
        Task UpdateAsync(Flight flight);
        Task DeleteAsync(Flight flight);
        Task<int> GetCountAsync();
    }
}
