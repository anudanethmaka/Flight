using Microsoft.EntityFrameworkCore;
using SkyLink.BookingService.Models;

namespace SkyLink.BookingService.Data
{
    public class BookingDbContext : DbContext
    {
        public BookingDbContext(DbContextOptions<BookingDbContext> options) : base(options)
        {
        }

        public DbSet<Booking> Bookings { get; set; } = null!;
        public DbSet<Ticket> Tickets { get; set; } = null!;

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure TotalPrice scale
            modelBuilder.Entity<Booking>()
                .Property(b => b.TotalPrice)
                .HasPrecision(18, 2);

            // Cascade delete tickets on booking deletion
            modelBuilder.Entity<Booking>()
                .HasMany(b => b.Tickets)
                .WithOne(t => t.Booking)
                .HasForeignKey(t => t.BookingId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Booking>()
                .HasIndex(b => b.BookingReference)
                .IsUnique();
        }
    }
}
