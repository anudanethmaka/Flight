using System.ComponentModel.DataAnnotations;

namespace SkyLink.NotificationService.Models
{
    public class Notification
    {
        public int Id { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public string Message { get; set; } = string.Empty;

        [Required]
        public string Type { get; set; } = string.Empty; // BookingConfirmation, FlightDelay, FlightCancellation

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        [Required]
        public bool IsRead { get; set; } = false;

        [Required]
        public bool EmailSimulated { get; set; } = false;
    }
}
