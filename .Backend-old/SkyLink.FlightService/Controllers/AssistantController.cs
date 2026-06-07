using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkyLink.FlightService.Repositories;
using System.Text.Json;
using System.Text;

namespace SkyLink.FlightService.Controllers
{
    [ApiController]
    [Route("api/flights/[controller]")]
    public class AssistantController : ControllerBase
    {
        private readonly IFlightRepository _flightRepository;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AssistantController> _logger;

        public AssistantController(
            IFlightRepository flightRepository,
            IHttpClientFactory httpClientFactory,
            IConfiguration configuration,
            ILogger<AssistantController> logger)
        {
            _flightRepository = flightRepository;
            _httpClientFactory = httpClientFactory;
            _configuration = configuration;
            _logger = logger;
        }

        public class ChatRequest { public string Message { get; set; } }

        [HttpPost("chat")]
        [AllowAnonymous]
        public async Task<IActionResult> Chat([FromBody] ChatRequest request)
        {
            var apiKey = _configuration["GeminiApiKey"];
            if (string.IsNullOrEmpty(apiKey)) return StatusCode(500, new { message = "Gemini API key is not configured." });

            var client = _httpClientFactory.CreateClient();
            
            var systemInstruction = @"You are SkyLink's AI Travel Assistant. The user will ask for flights. 
Extract 'departure', 'arrival' (use airport codes if possible, or leave blank), and 'date' (YYYY-MM-DD format if mentioned, else blank). 
Return exactly this JSON format, no markdown tags or other text:
{
  ""departure"": """",
  ""arrival"": """",
  ""date"": """",
  ""message"": ""A friendly message summarizing the search parameters and confirming you are looking for flights.""
}";
            
            var payload = new
            {
                system_instruction = new { parts = new[] { new { text = systemInstruction } } },
                contents = new[]
                {
                    new { role = "user", parts = new[] { new { text = request.Message } } }
                },
                generationConfig = new { response_mime_type = "application/json" }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json");
            var response = await client.PostAsync($"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={apiKey}", jsonContent);
            
            if (!response.IsSuccessStatusCode)
            {
                var err = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Gemini API error: {err}");
                return StatusCode(500, new { message = "Failed to communicate with AI assistant." });
            }

            var resultStr = await response.Content.ReadAsStringAsync();
            var resultDoc = JsonDocument.Parse(resultStr);
            var textResult = resultDoc.RootElement
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text").GetString();

            try {
                var parsedData = JsonSerializer.Deserialize<AiSearchData>(textResult, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                
                string dep = string.IsNullOrEmpty(parsedData?.Departure) ? null : parsedData.Departure;
                string arr = string.IsNullOrEmpty(parsedData?.Arrival) ? null : parsedData.Arrival;
                DateTime? date = null;
                if (!string.IsNullOrEmpty(parsedData?.Date) && DateTime.TryParse(parsedData.Date, out var dt)) {
                    date = dt;
                }

                var flights = await _flightRepository.SearchAsync(dep, arr, date);

                return Ok(new {
                    message = parsedData?.Message ?? "Here is what I found for you.",
                    flights = flights,
                    searchParams = parsedData
                });
            } catch(Exception ex) {
                _logger.LogError(ex, "Failed to parse AI response.");
                return Ok(new { message = "I couldn't quite understand the flight details. Could you specify the departure, arrival, and date?", flights = new object[0] });
            }
        }

        private class AiSearchData {
            public string Departure { get; set; }
            public string Arrival { get; set; }
            public string Date { get; set; }
            public string Message { get; set; }
        }
    }
}
