using Microsoft.IdentityModel.Tokens;
using SkyLink.AuthService.DTOs;
using SkyLink.AuthService.Helpers;
using SkyLink.AuthService.Models;
using SkyLink.AuthService.Repositories;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace SkyLink.AuthService.Services
{
    public class AuthService : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(IUserRepository userRepository, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _userRepository = userRepository;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<AuthResponseDto?> LoginAsync(LoginDto loginDto)
        {
            var user = await _userRepository.GetByUsernameAsync(loginDto.Username);
            if (user == null || !PasswordHasher.VerifyPassword(loginDto.Password, user.PasswordHash))
            {
                return null;
            }

            var token = GenerateJwtToken(user);

            return new AuthResponseDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role?.Name ?? "Passenger",
                Token = token
            };
        }

        public async Task<UserProfileDto?> RegisterAsync(RegisterDto registerDto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(registerDto.Username);
            if (existingUser != null) return null;

            existingUser = await _userRepository.GetByEmailAsync(registerDto.Email);
            if (existingUser != null) return null;

            var user = new User
            {
                Username = registerDto.Username,
                Email = registerDto.Email,
                FullName = registerDto.FullName,
                RoleId = 3, // Default is Passenger
                PasswordHash = PasswordHasher.HashPassword(registerDto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);

            // Fetch the user with the loaded Role object
            var savedUser = await _userRepository.GetByIdAsync(user.Id);
            return MapToProfileDto(savedUser!);
        }

        public async Task<UserProfileDto?> GetProfileAsync(int userId)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;
            return MapToProfileDto(user);
        }

        public async Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto updateDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return null;

            // Check if email is already taken by someone else
            var userWithEmail = await _userRepository.GetByEmailAsync(updateDto.Email);
            if (userWithEmail != null && userWithEmail.Id != userId)
            {
                return null; // Email already in use
            }

            user.FullName = updateDto.FullName;
            user.Email = updateDto.Email;

            await _userRepository.UpdateAsync(user);
            return MapToProfileDto(user);
        }

        public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto)
        {
            var user = await _userRepository.GetByIdAsync(userId);
            if (user == null) return false;

            if (!PasswordHasher.VerifyPassword(changePasswordDto.CurrentPassword, user.PasswordHash))
            {
                return false;
            }

            user.PasswordHash = PasswordHasher.HashPassword(changePasswordDto.NewPassword);
            await _userRepository.UpdateAsync(user);
            return true;
        }

        public async Task<UserProfileDto?> CreateStaffAsync(CreateStaffDto staffDto)
        {
            var existingUser = await _userRepository.GetByUsernameAsync(staffDto.Username);
            if (existingUser != null) return null;

            existingUser = await _userRepository.GetByEmailAsync(staffDto.Email);
            if (existingUser != null) return null;

            var user = new User
            {
                Username = staffDto.Username,
                Email = staffDto.Email,
                FullName = staffDto.FullName,
                RoleId = 2, // Staff Role ID
                PasswordHash = PasswordHasher.HashPassword(staffDto.Password),
                CreatedAt = DateTime.UtcNow
            };

            await _userRepository.CreateAsync(user);
            var savedUser = await _userRepository.GetByIdAsync(user.Id);
            return MapToProfileDto(savedUser!);
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var jwtKey = _configuration["Jwt:Key"];
            
            if (string.IsNullOrEmpty(jwtKey))
            {
                _logger.LogWarning("JWT Key is missing from configuration. Falling back to development ephemeral secret.");
                jwtKey = "super_secret_local_development_jwt_key_must_be_at_least_32_bytes_long"; // Fallback for local debugging
            }

            var key = Encoding.ASCII.GetBytes(jwtKey);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Role, user.Role?.Name ?? "Passenger")
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                Issuer = _configuration["Jwt:Issuer"] ?? "SkyLinkAPI",
                Audience = _configuration["Jwt:Audience"] ?? "SkyLinkWeb",
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        private UserProfileDto MapToProfileDto(User user)
        {
            return new UserProfileDto
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                FullName = user.FullName,
                Role = user.Role?.Name ?? "Passenger",
                CreatedAt = user.CreatedAt
            };
        }
    }
}
