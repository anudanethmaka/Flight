using System.ComponentModel.DataAnnotations;

namespace SkyLink.BookingService.DTOs
{
    public class PassengerTicketDto
    {
        [Required]
        public string PassengerName { get; set; } = string.Empty;

        [Required]
        public string SeatNumber { get; set; } = string.Empty;
    }

    public class CreateBookingDto
    {
        [Required]
        public int FlightId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one ticket must be booked.")]
        public List<PassengerTicketDto> Passengers { get; set; } = new List<PassengerTicketDto>();
    }

    public class TicketDetailsDto
    {
        public int Id { get; set; }
        public string TicketNumber { get; set; } = string.Empty;
        public string PassengerName { get; set; } = string.Empty;
        public string SeatNumber { get; set; } = string.Empty;
    }

    public class BookingDetailsDto
    {
        public int Id { get; set; }
        public string BookingReference { get; set; } = string.Empty;
        public int UserId { get; set; }
        public int FlightId { get; set; }
        public DateTime BookingDate { get; set; }
        public string Status { get; set; } = string.Empty;
        public decimal TotalPrice { get; set; }
        public List<TicketDetailsDto> Tickets { get; set; } = new List<TicketDetailsDto>();
    }

    public class BookingPassengerDto
    {
        public int UserId { get; set; }
        public string BookingReference { get; set; } = string.Empty;
    }
}
