using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SkyLink.FlightService.Models
{
    public class Flight
    {
        public int Id { get; set; }

        [Required]
        public string FlightNumber { get; set; } = string.Empty;

        [Required]
        public string DepartureAirport { get; set; } = string.Empty;

        [Required]
        public string ArrivalAirport { get; set; } = string.Empty;

        [Required]
        public DateTime DepartureDate { get; set; }

        [Required]
        public string DepartureTime { get; set; } = string.Empty; // e.g. "08:30"

        [Required]
        public string ArrivalTime { get; set; } = string.Empty; // e.g. "11:45"

        [Required]
        public int AvailableSeats { get; set; }

        [Required]
        public int TotalSeats { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2]")]
        public decimal Price { get; set; }

        [Required]
        public string FlightStatus { get; set; } = "Scheduled"; // Scheduled, Boarding, Delayed, Cancelled, Completed
    }
}
