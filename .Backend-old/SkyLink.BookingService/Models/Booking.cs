using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SkyLink.BookingService.Models
{
    public class Booking
    {
        public int Id { get; set; }

        [Required]
        public string BookingReference { get; set; } = string.Empty; // e.g. "SLK-ABC12345"

        [Required]
        public int UserId { get; set; } // Logical FK to AuthService.User

        [Required]
        public int FlightId { get; set; } // Logical FK to FlightService.Flight

        [Required]
        public DateTime BookingDate { get; set; } = DateTime.UtcNow;

        [Required]
        public string Status { get; set; } = "Pending"; // Pending, Confirmed, Cancelled

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalPrice { get; set; }

        public List<Ticket> Tickets { get; set; } = new List<Ticket>();
    }
}
