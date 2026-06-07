using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkyLink.NotificationService.Data;
using SkyLink.NotificationService.DTOs;
using SkyLink.NotificationService.Models;
using System.Security.Claims;
using System.Text.Json;

namespace SkyLink.NotificationService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationDbContext _context;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<NotificationsController> _logger;

        public NotificationsController(
            NotificationDbContext context,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<NotificationsController> _logger)
        {
            _context = context;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            this._logger = _logger;
        }

        [HttpGet("my")]
        [Authorize]
        public async Task<IActionResult> GetMyNotifications()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var notifications = await _context.Notifications
                .Where(n => n.UserId == userId)
                .OrderByDescending(n => n.CreatedAt)
                .ToListAsync();

            return Ok(notifications);
        }

        [HttpPut("{id}/read")]
        [Authorize]
        public async Task<IActionResult> MarkAsRead(int id)
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var notification = await _context.Notifications.FindAsync(id);
            if (notification == null)
            {
                return NotFound(new { message = "Notification not found." });
            }

            if (notification.UserId != userId)
            {
                return Forbid();
            }

            notification.IsRead = true;
            await _context.SaveChangesAsync();

            return Ok(notification);
        }

        // Internal endpoint called by BookingService
        [HttpPost("send")]
        [AllowAnonymous]
        public async Task<IActionResult> SendNotification([FromBody] SendNotificationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var notification = new Notification
            {
                UserId = dto.UserId,
                Message = dto.Message,
                Type = dto.Type,
                CreatedAt = DateTime.UtcNow,
                IsRead = false,
                EmailSimulated = true
            };

            _context.Notifications.Add(notification);
            await _context.SaveChangesAsync();

            // Simulate Email Send
            SimulateEmail(notification.UserId, dto.Type, notification.Message);

            return Ok(notification);
        }

        // Internal endpoint called by FlightService when a flight status changes
        [HttpPost("flight-update")]
        [AllowAnonymous]
        public async Task<IActionResult> HandleFlightUpdate([FromBody] FlightUpdateNotificationDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var client = _httpClientFactory.CreateClient();
            var bookingServiceUrl = _configuration["Services:BookingService"];

            List<BookingPassengerDto>? passengers = null;
            try
            {
                // Fetch passenger user IDs who have active bookings for this flight
                var response = await client.GetAsync($"{bookingServiceUrl}/api/bookings/passengers?flightId={dto.FlightId}");
                if (response.IsSuccessStatusCode)
                {
                    var content = await response.Content.ReadAsStringAsync();
                    passengers = JsonSerializer.Deserialize<List<BookingPassengerDto>>(content, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to connect to BookingService to get passenger list.");
                return StatusCode(503, new { message = "Booking Service is unavailable." });
            }

            if (passengers == null || !passengers.Any())
            {
                _logger.LogInformation($"No passengers booked for flight {dto.FlightNumber}. No notifications sent.");
                return Ok(new { message = "No notifications generated. No active bookings found." });
            }

            var notificationType = dto.Status.Equals("Cancelled", StringComparison.OrdinalIgnoreCase) 
                ? "FlightCancellation" 
                : "FlightDelay";

            var notificationCount = 0;
            foreach (var passenger in passengers)
            {
                var customMsg = $"Flight {dto.FlightNumber} update: Status changed to {dto.Status}. Details: {dto.Message} (Ref: {passenger.BookingReference})";
                
                var notification = new Notification
                {
                    UserId = passenger.UserId,
                    Message = customMsg,
                    Type = notificationType,
                    CreatedAt = DateTime.UtcNow,
                    IsRead = false,
                    EmailSimulated = true
                };

                _context.Notifications.Add(notification);
                SimulateEmail(passenger.UserId, notificationType, customMsg);
                notificationCount++;
            }

            await _context.SaveChangesAsync();

            return Ok(new { message = $"Notifications created and emails simulated for {notificationCount} passengers." });
        }

        private void SimulateEmail(int userId, string type, string message)
        {
            _logger.LogInformation(
                "\n================================================================================\n" +
                "[EMAIL SIMULATION]\n" +
                $"To User ID: {userId}\n" +
                $"Type: {type}\n" +
                $"Timestamp: {DateTime.UtcNow}\n" +
                $"Subject: SkyLink System Alert - {type}\n" +
                $"Message Body:\n" +
                $"Dear SkyLink Passenger,\n\n" +
                $"{message}\n\n" +
                "Thank you for choosing SkyLink Airlines!\n" +
                "================================================================================\n"
            );
        }
    }
}
