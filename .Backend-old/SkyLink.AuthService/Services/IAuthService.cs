using SkyLink.AuthService.DTOs;

namespace SkyLink.AuthService.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto?> LoginAsync(LoginDto loginDto);
        Task<UserProfileDto?> RegisterAsync(RegisterDto registerDto);
        Task<UserProfileDto?> GetProfileAsync(int userId);
        Task<UserProfileDto?> UpdateProfileAsync(int userId, UpdateProfileDto updateDto);
        Task<bool> ChangePasswordAsync(int userId, ChangePasswordDto changePasswordDto);
        Task<UserProfileDto?> CreateStaffAsync(CreateStaffDto staffDto);
    }
}
