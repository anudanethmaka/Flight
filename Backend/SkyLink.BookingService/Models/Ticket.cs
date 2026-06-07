using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace SkyLink.BookingService.Models
{
    public class Ticket
    {
        public int Id { get; set; }

        [Required]
        public int BookingId { get; set; }

        [JsonIgnore]
        public Booking? Booking { get; set; }

        [Required]
        public string TicketNumber { get; set; } = string.Empty; // e.g. "TKT-12345678"

        [Required]
        public string PassengerName { get; set; } = string.Empty;

        [Required]
        public string SeatNumber { get; set; } = string.Empty; // e.g. "12A"
    }
}
