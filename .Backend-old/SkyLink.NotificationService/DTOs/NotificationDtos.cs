using System.ComponentModel.DataAnnotations;

namespace SkyLink.NotificationService.DTOs
{
    public class SendNotificationDto
    {
        [Required]
        public int UserId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty; // BookingConfirmation, FlightDelay, FlightCancellation
    }

    public class FlightUpdateNotificationDto
    {
        [Required]
        public int FlightId { get; set; }

        [Required]
        public string FlightNumber { get; set; } = string.Empty;

        [Required]
        public string Status { get; set; } = string.Empty; // Delayed, Cancelled

        [Required]
        public string Message { get; set; } = string.Empty;
    }

    public class BookingPassengerDto
    {
        public int UserId { get; set; }
        public string BookingReference { get; set; } = string.Empty;
    }
}
