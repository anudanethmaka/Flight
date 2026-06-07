using System.ComponentModel.DataAnnotations;

namespace SkyLink.FlightService.DTOs
{
    public class CreateFlightDto
    {
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
        [Range(1, 1000, ErrorMessage = "Total seats must be between 1 and 1000.")]
        public int TotalSeats { get; set; }

        [Required]
        [Range(0, 100000, ErrorMessage = "Price must be a positive value.")]
        public decimal Price { get; set; }
    }

    public class UpdateFlightDto
    {
        [Required]
        public string FlightNumber { get; set; } = string.Empty;

        [Required]
        public string DepartureAirport { get; set; } = string.Empty;

        [Required]
        public string ArrivalAirport { get; set; } = string.Empty;

        [Required]
        public DateTime DepartureDate { get; set; }

        [Required]
        public string DepartureTime { get; set; } = string.Empty;

        [Required]
        public string ArrivalTime { get; set; } = string.Empty;

        [Required]
        [Range(1, 1000)]
        public int TotalSeats { get; set; }

        [Required]
        [Range(0, 100000)]
        public decimal Price { get; set; }

        [Required]
        public string FlightStatus { get; set; } = "Scheduled"; // Scheduled, Boarding, Delayed, Cancelled, Completed
    }
}
