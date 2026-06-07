using Microsoft.EntityFrameworkCore;
using SkyLink.AuthService.Models;
using SkyLink.AuthService.Helpers;

namespace SkyLink.AuthService.Data
{
    public class AuthDbContext : DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;
        public DbSet<Role> Roles { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Role)
                .WithMany()
                .HasForeignKey(u => u.RoleId)
                .OnDelete(DeleteBehavior.Restrict);

            // Unique constraints
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username)
                .IsUnique();

            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email)
                .IsUnique();

            // Seed Roles
            modelBuilder.Entity<Role>().HasData(
                new Role { Id = 1, Name = "Administrator" },
                new Role { Id = 2, Name = "Staff" },
                new Role { Id = 3, Name = "Passenger" }
            );

            // Seed Admin User (using a hashed password)
            var adminUser = new User
            {
                Id = 1,
                Username = "admin",
                Email = "admin@skylink.com",
                FullName = "System Administrator",
                RoleId = 1, // Administrator
                PasswordHash = PasswordHasher.HashPassword("AdminPassword123"),
                CreatedAt = new DateTime(2026, 6, 7, 0, 0, 0, DateTimeKind.Utc)
            };

            modelBuilder.Entity<User>().HasData(adminUser);
        }
    }
}
