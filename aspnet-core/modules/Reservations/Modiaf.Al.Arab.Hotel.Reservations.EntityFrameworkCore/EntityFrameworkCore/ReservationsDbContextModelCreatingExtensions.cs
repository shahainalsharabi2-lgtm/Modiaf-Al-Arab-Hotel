using Microsoft.EntityFrameworkCore;
using Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore.Configurations;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore;

public static class ReservationsDbContextModelCreatingExtensions
{
    public static void ConfigureReservations(this ModelBuilder builder)
    {
        builder.ApplyConfiguration(new BookingEntityTypeConfiguration());
    }
}
