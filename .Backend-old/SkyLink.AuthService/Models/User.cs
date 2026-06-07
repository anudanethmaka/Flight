using System.Text.Json.Serialization;

namespace SkyLink.AuthService.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        
        [JsonIgnore]
        public string PasswordHash { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public int RoleId { get; set; }
        public Role? Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
