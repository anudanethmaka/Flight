using Microsoft.EntityFrameworkCore;
using SkyLink.NotificationService.Models;

namespace SkyLink.NotificationService.Data
{
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
        {
        }

        public DbSet<Notification> Notifications { get; set; } = null!;
    }
}
