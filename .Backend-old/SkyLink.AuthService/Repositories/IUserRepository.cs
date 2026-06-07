using SkyLink.AuthService.Models;

namespace SkyLink.AuthService.Repositories
{
    public interface IUserRepository
    {
        Task<User?> GetByIdAsync(int id);
        Task<User?> GetByUsernameAsync(string username);
        Task<User?> GetByEmailAsync(string email);
        Task<IEnumerable<User>> GetAllAsync();
        Task CreateAsync(User user);
        Task UpdateAsync(User user);
        Task<int> GetCountAsync();
        Task<IEnumerable<User>> GetStaffAccountsAsync();
    }
}
