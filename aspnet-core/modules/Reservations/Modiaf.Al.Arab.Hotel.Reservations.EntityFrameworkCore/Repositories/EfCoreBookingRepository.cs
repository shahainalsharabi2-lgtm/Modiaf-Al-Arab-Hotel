using Modiaf.Al.Arab.Hotel.Bookings;
using Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore;
using Modiaf.Al.Arab.Hotel.Reservations.Repositories;
using Volo.Abp.DependencyInjection;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Domain.Repositories.EntityFrameworkCore;
using Volo.Abp.EntityFrameworkCore;

namespace Modiaf.Al.Arab.Hotel.Reservations.Repositories;

[Dependency(ReplaceServices = true)]
[ExposeServices(typeof(IRepository<Booking, int>), typeof(IBookingRepository))]
public class EfCoreBookingRepository(IDbContextProvider<IReservationsDbContext> dbContextProvider)
    : EfCoreRepository<IReservationsDbContext, Booking, int>(dbContextProvider), IBookingRepository;
