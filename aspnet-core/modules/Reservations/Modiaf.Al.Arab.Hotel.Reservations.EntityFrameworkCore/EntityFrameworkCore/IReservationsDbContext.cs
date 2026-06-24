using Microsoft.EntityFrameworkCore;
using Modiaf.Al.Arab.Hotel.Bookings;
using Volo.Abp.Data;
using Volo.Abp.EntityFrameworkCore;

namespace Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore;

[ConnectionStringName("Default")]
public interface IReservationsDbContext : IEfCoreDbContext
{
    DbSet<Booking> Bookings { get; }
}
