using Microsoft.EntityFrameworkCore;
using Modiaf.Al.Arab.Hotel.Bookings;
using Volo.Abp.EntityFrameworkCore;

namespace Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore;

/// <summary>سياق EF للوحدة؛ يُستبدَل بـ HotelDbContext في المضيف عبر ReplaceDbContext.</summary>
public class ReservationsDbContext(DbContextOptions<ReservationsDbContext> options)
    : AbpDbContext<ReservationsDbContext>(options), IReservationsDbContext
{
    public DbSet<Booking> Bookings { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        builder.ConfigureReservations();
    }
}
