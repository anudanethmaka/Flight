using Microsoft.AspNetCore.Mvc;
using System.Text.Json;

namespace SkyLink.Gateway.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StatisticsController : ControllerBase
    {
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<StatisticsController> _logger;

        public StatisticsController(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<StatisticsController> logger)
        {
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetStatistics()
        {
            var client = _httpClientFactory.CreateClient();
            var authUrl = _configuration["Microservices:AuthService"];
            var flightUrl = _configuration["Microservices:FlightService"];
            var bookingUrl = _configuration["Microservices:BookingService"];

            int totalUsers = 0;
            int totalFlights = 0;
            int totalBookings = 0;

            try
            {
                var authResponse = await client.GetAsync($"{authUrl}/api/auth/count");
                if (authResponse.IsSuccessStatusCode)
                {
                    var content = await authResponse.Content.ReadAsStringAsync();
                    totalUsers = JsonSerializer.Deserialize<int>(content);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch user count from AuthService");
            }

            try
            {
                var flightResponse = await client.GetAsync($"{flightUrl}/api/flights/count");
                if (flightResponse.IsSuccessStatusCode)
                {
                    var content = await flightResponse.Content.ReadAsStringAsync();
                    totalFlights = JsonSerializer.Deserialize<int>(content);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch flight count from FlightService");
            }

            try
            {
                var bookingResponse = await client.GetAsync($"{bookingUrl}/api/bookings/count");
                if (bookingResponse.IsSuccessStatusCode)
                {
                    var content = await bookingResponse.Content.ReadAsStringAsync();
                    totalBookings = JsonSerializer.Deserialize<int>(content);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to fetch booking count from BookingService");
            }

            return Ok(new
            {
                totalUsers,
                totalFlights,
                totalBookings
            });
        }
    }
}
