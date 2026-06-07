using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkyLink.FlightService.DTOs;
using SkyLink.FlightService.Models;
using SkyLink.FlightService.Repositories;
using System.Text.Json;
using System.Text;

namespace SkyLink.FlightService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FlightsController : ControllerBase
    {
        private readonly IFlightRepository _flightRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<FlightsController> _logger;

        public FlightsController(
            IFlightRepository flightRepository,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<FlightsController> logger)
        {
            _flightRepository = flightRepository;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> SearchFlights([FromQuery] string? departure, [FromQuery] string? arrival, [FromQuery] DateTime? date)
        {
            var flights = await _flightRepository.SearchAsync(departure, arrival, date);
            return Ok(flights);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetFlightById(int id)
        {
            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
            {
                return NotFound(new { message = "Flight not found." });
            }
            return Ok(flight);
        }

        [HttpPost]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> CreateFlight([FromBody] CreateFlightDto createDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var flight = new Flight
            {
                FlightNumber = createDto.FlightNumber.ToUpper().Trim(),
                DepartureAirport = createDto.DepartureAirport.Trim(),
                ArrivalAirport = createDto.ArrivalAirport.Trim(),
                DepartureDate = createDto.DepartureDate,
                DepartureTime = createDto.DepartureTime.Trim(),
                ArrivalTime = createDto.ArrivalTime.Trim(),
                TotalSeats = createDto.TotalSeats,
                AvailableSeats = createDto.TotalSeats, // initially all seats are available
                Price = createDto.Price,
                FlightStatus = "Scheduled"
            };

            await _flightRepository.CreateAsync(flight);
            return CreatedAtAction(nameof(GetFlightById), new { id = flight.Id }, flight);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> UpdateFlight(int id, [FromBody] UpdateFlightDto updateDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
            {
                return NotFound(new { message = "Flight not found." });
            }

            var oldStatus = flight.FlightStatus;

            // Map updates
            flight.FlightNumber = updateDto.FlightNumber.ToUpper().Trim();
            flight.DepartureAirport = updateDto.DepartureAirport.Trim();
            flight.ArrivalAirport = updateDto.ArrivalAirport.Trim();
            flight.DepartureDate = updateDto.DepartureDate;
            flight.DepartureTime = updateDto.DepartureTime.Trim();
            flight.ArrivalTime = updateDto.ArrivalTime.Trim();
            flight.Price = updateDto.Price;
            
            // Adjust available seats if capacity changed
            var soldSeats = flight.TotalSeats - flight.AvailableSeats;
            flight.TotalSeats = updateDto.TotalSeats;
            flight.AvailableSeats = Math.Max(0, updateDto.TotalSeats - soldSeats);
            
            flight.FlightStatus = updateDto.FlightStatus.Trim();

            await _flightRepository.UpdateAsync(flight);

            // Check if status changed to Delayed or Cancelled to trigger notifications
            if (flight.FlightStatus != oldStatus && 
                (flight.FlightStatus.Equals("Delayed", StringComparison.OrdinalIgnoreCase) || 
                 flight.FlightStatus.Equals("Cancelled", StringComparison.OrdinalIgnoreCase)))
            {
                await TriggerFlightStatusNotificationAsync(flight);
            }

            return Ok(flight);
        }

        [HttpDelete("{id}")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> DeleteFlight(int id)
        {
            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
            {
                return NotFound(new { message = "Flight not found." });
            }

            await _flightRepository.DeleteAsync(flight);
            return Ok(new { message = "Flight deleted successfully." });
        }

        // Action invoked by BookingService to block/unblock seats
        [HttpPut("{id}/seats")]
        [AllowAnonymous] // Internal communication
        public async Task<IActionResult> AdjustSeats(int id, [FromQuery] int change)
        {
            var flight = await _flightRepository.GetByIdAsync(id);
            if (flight == null)
            {
                return NotFound(new { message = "Flight not found." });
            }

            if (flight.AvailableSeats + change < 0)
            {
                return BadRequest(new { message = "Not enough available seats." });
            }

            if (flight.AvailableSeats + change > flight.TotalSeats)
            {
                return BadRequest(new { message = "Cannot exceed total seats capacity." });
            }

            flight.AvailableSeats += change;
            await _flightRepository.UpdateAsync(flight);

            return Ok(flight);
        }

        [HttpGet("count")]
        [AllowAnonymous] // Internal query
        public async Task<IActionResult> GetFlightCount()
        {
            var count = await _flightRepository.GetCountAsync();
            return Ok(count);
        }

        private async Task TriggerFlightStatusNotificationAsync(Flight flight)
        {
            try
            {
                var notificationServiceUrl = _configuration["Services:NotificationService"];
                if (string.IsNullOrEmpty(notificationServiceUrl))
                {
                    _logger.LogWarning("NotificationService URL not configured. Skipping status update notification.");
                    return;
                }

                var client = _httpClientFactory.CreateClient();
                var payload = new
                {
                    FlightId = flight.Id,
                    FlightNumber = flight.FlightNumber,
                    Status = flight.FlightStatus,
                    Message = $"Flight {flight.FlightNumber} has been {flight.FlightStatus}."
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                var response = await client.PostAsync($"{notificationServiceUrl}/api/notifications/flight-update", content);

                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError($"Failed to trigger flight notification. Status: {response.StatusCode}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while calling NotificationService for flight status change.");
            }
        }
    }
}
