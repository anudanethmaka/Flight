using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkyLink.BookingService.Data;
using SkyLink.BookingService.DTOs;
using SkyLink.BookingService.Models;
using System.Security.Claims;
using System.Text;
using System.Text.Json;

namespace SkyLink.BookingService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingsController : ControllerBase
    {
        private readonly BookingDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<BookingsController> _logger;

        public BookingsController(
            BookingDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<BookingsController> logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> BookFlight([FromBody] CreateBookingDto bookingDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var client = _httpClientFactory.CreateClient();
            var flightUrl = _configuration["Services:FlightService"];
            var notificationUrl = _configuration["Services:NotificationService"];

            // 1. Fetch flight info to verify seats & price
            FlightDto? flight = null;
            try
            {
                var flightResponse = await client.GetAsync($"{flightUrl}/api/flights/{bookingDto.FlightId}");
                if (!flightResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "Selected flight does not exist." });
                }

                var content = await flightResponse.Content.ReadAsStringAsync();
                flight = JsonSerializer.Deserialize<FlightDto>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to FlightService");
                return StatusCode(503, new { message = "Flight Service is currently unavailable." });
            }

            if (flight == null)
            {
                return BadRequest(new { message = "Error reading flight details." });
            }

            if (flight.AvailableSeats < bookingDto.Passengers.Count)
            {
                return BadRequest(new { message = $"Not enough available seats on this flight. Available: {flight.AvailableSeats}" });
            }

            // 2. Adjust available seats in FlightService
            try
            {
                var seatResponse = await client.PutAsync($"{flightUrl}/api/flights/{bookingDto.FlightId}/seats?change=-{bookingDto.Passengers.Count}", null);
                if (!seatResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "Failed to reserve seats. Please try again." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to adjust seats in FlightService");
                return StatusCode(503, new { message = "Failed to lock seats with Flight Service." });
            }

            // 3. Create Booking & Tickets
            var refCode = "SLK-" + Guid.NewGuid().ToString("N").Substring(0, 8).ToUpper();
            var booking = new Booking
            {
                BookingReference = refCode,
                UserId = userId,
                FlightId = bookingDto.FlightId,
                BookingDate = DateTime.UtcNow,
                Status = "Confirmed",
                TotalPrice = flight.Price * bookingDto.Passengers.Count
            };

            foreach (var pass in bookingDto.Passengers)
            {
                booking.Tickets.Add(new Ticket
                {
                    TicketNumber = "TKT-" + Guid.NewGuid().ToString("N").Substring(0, 10).ToUpper(),
                    PassengerName = pass.PassengerName.Trim(),
                    SeatNumber = pass.SeatNumber.ToUpper().Trim()
                });
            }

            _context.Bookings.Add(booking);
            await _context.SaveChangesAsync();

            // 4. Send Notification
            try
            {
                var payload = new
                {
                    UserId = userId,
                    Message = $"Booking confirmed! Ref: {booking.BookingReference} for Flight {flight.FlightNumber} from {flight.DepartureAirport} to {flight.ArrivalAirport}.",
                    Type = "BookingConfirmation"
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                await client.PostAsync($"{notificationUrl}/api/notifications/send", content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification for booking confirmation.");
            }

            return Ok(MapToDetailsDto(booking));
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyBookings()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var bookings = await _context.Bookings
                .Include(b => b.Tickets)
                .Where(b => b.UserId == userId)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return Ok(bookings.Select(MapToDetailsDto));
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetBookingById(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Tickets)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            // Authorization: Admin, Staff, or Owner
            if (booking.UserId != userId && userRole != "Administrator" && userRole != "Staff")
            {
                return Forbid();
            }

            return Ok(MapToDetailsDto(booking));
        }

        [HttpPut("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelBooking(int id)
        {
            var booking = await _context.Bookings
                .Include(b => b.Tickets)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (booking == null)
            {
                return NotFound(new { message = "Booking not found." });
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            // Authorization: Admin, Staff, or Owner
            if (booking.UserId != userId && userRole != "Administrator" && userRole != "Staff")
            {
                return Forbid();
            }

            if (booking.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase))
            {
                return BadRequest(new { message = "Booking is already cancelled." });
            }

            // 1. Restock available seats in FlightService
            var client = _httpClientFactory.CreateClient();
            var flightUrl = _configuration["Services:FlightService"];
            var notificationUrl = _configuration["Services:NotificationService"];

            try
            {
                var seatResponse = await client.PutAsync($"{flightUrl}/api/flights/{booking.FlightId}/seats?change={booking.Tickets.Count}", null);
                if (!seatResponse.IsSuccessStatusCode)
                {
                    return BadRequest(new { message = "Failed to update seats in Flight Service." });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to restock seats in FlightService");
                // Continue cancellation anyway to preserve DB integrity, but log warning
            }

            // 2. Set Status to Cancelled
            booking.Status = "Cancelled";
            await _context.SaveChangesAsync();

            // 3. Send Notification
            try
            {
                var payload = new
                {
                    UserId = booking.UserId,
                    Message = $"Your booking Ref: {booking.BookingReference} has been cancelled successfully.",
                    Type = "FlightCancellation"
                };

                var content = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
                await client.PostAsync($"{notificationUrl}/api/notifications/send", content);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send notification for booking cancellation.");
            }

            return Ok(MapToDetailsDto(booking));
        }

        // Administrative endpoints
        [HttpGet]
        [Authorize(Roles = "Administrator,Staff")]
        public async Task<IActionResult> GetAllBookings()
        {
            var bookings = await _context.Bookings
                .Include(b => b.Tickets)
                .OrderByDescending(b => b.BookingDate)
                .ToListAsync();

            return Ok(bookings.Select(MapToDetailsDto));
        }

        [HttpGet("count")]
        [AllowAnonymous] // Internal query
        public async Task<IActionResult> GetBookingCount()
        {
            var count = await _context.Bookings.CountAsync();
            return Ok(count);
        }

        // Internal query from NotificationService to get passengers of a modified flight
        [HttpGet("passengers")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPassengersForFlight([FromQuery] int flightId)
        {
            var bookings = await _context.Bookings
                .Where(b => b.FlightId == flightId && b.Status == "Confirmed")
                .Select(b => new BookingPassengerDto
                {
                    UserId = b.UserId,
                    BookingReference = b.BookingReference
                })
                .ToListAsync();

            return Ok(bookings);
        }

        private BookingDetailsDto MapToDetailsDto(Booking b)
        {
            return new BookingDetailsDto
            {
                Id = b.Id,
                BookingReference = b.BookingReference,
                UserId = b.UserId,
                FlightId = b.FlightId,
                BookingDate = b.BookingDate,
                Status = b.Status,
                TotalPrice = b.TotalPrice,
                Tickets = b.Tickets.Select(t => new TicketDetailsDto
                {
                    Id = t.Id,
                    TicketNumber = t.TicketNumber,
                    PassengerName = t.PassengerName,
                    SeatNumber = t.SeatNumber
                }).ToList()
            };
        }

        // Inner DTO for Flight Service communication
        private class FlightDto
        {
            public string FlightNumber { get; set; } = string.Empty;
            public string DepartureAirport { get; set; } = string.Empty;
            public string ArrivalAirport { get; set; } = string.Empty;
            public decimal Price { get; set; }
            public int AvailableSeats { get; set; }
            public int TotalSeats { get; set; }
        }
    }
}
