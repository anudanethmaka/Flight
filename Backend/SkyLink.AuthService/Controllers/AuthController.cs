using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkyLink.AuthService.DTOs;
using SkyLink.AuthService.Repositories;
using SkyLink.AuthService.Services;
using System.Security.Claims;

namespace SkyLink.AuthService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserRepository _userRepository;

        public AuthController(IAuthService authService, IUserRepository userRepository)
        {
            _authService = authService;
            _userRepository = userRepository;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<IActionResult> Register([FromBody] RegisterDto registerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var profile = await _authService.RegisterAsync(registerDto);
            if (profile == null)
            {
                return BadRequest(new { message = "Username or Email is already registered." });
            }

            return Ok(profile);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var authResponse = await _authService.LoginAsync(loginDto);
            if (authResponse == null)
            {
                return Unauthorized(new { message = "Invalid username or password." });
            }

            return Ok(authResponse);
        }

        [HttpGet("profile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var profile = await _authService.GetProfileAsync(userId);
            if (profile == null)
            {
                return NotFound(new { message = "User profile not found." });
            }

            return Ok(profile);
        }

        [HttpPut("profile")]
        [Authorize]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto updateProfileDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var profile = await _authService.UpdateProfileAsync(userId, updateProfileDto);
            if (profile == null)
            {
                return BadRequest(new { message = "Failed to update profile. Email might already be taken." });
            }

            return Ok(profile);
        }

        [HttpPut("change-password")]
        [Authorize]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDto changePasswordDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !int.TryParse(userIdStr, out int userId))
            {
                return Unauthorized();
            }

            var result = await _authService.ChangePasswordAsync(userId, changePasswordDto);
            if (!result)
            {
                return BadRequest(new { message = "Failed to change password. Please verify your current password." });
            }

            return Ok(new { message = "Password changed successfully." });
        }

        // Administrative endpoints
        [HttpGet("users")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _userRepository.GetAllAsync();
            var profiles = users.Select(u => new UserProfileDto
            {
                Id = u.Id,
                Username = u.Username,
                Email = u.Email,
                FullName = u.FullName,
                Role = u.Role?.Name ?? "Passenger",
                CreatedAt = u.CreatedAt
            });

            return Ok(profiles);
        }

        [HttpPost("staff")]
        [Authorize(Roles = "Administrator")]
        public async Task<IActionResult> CreateStaff([FromBody] CreateStaffDto staffDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var profile = await _authService.CreateStaffAsync(staffDto);
            if (profile == null)
            {
                return BadRequest(new { message = "Username or Email is already registered." });
            }

            return Ok(profile);
        }

        [HttpGet("count")]
        [AllowAnonymous] // Internal query from API Gateway
        public async Task<IActionResult> GetUserCount()
        {
            var count = await _userRepository.GetCountAsync();
            return Ok(count);
        }
    }
}
