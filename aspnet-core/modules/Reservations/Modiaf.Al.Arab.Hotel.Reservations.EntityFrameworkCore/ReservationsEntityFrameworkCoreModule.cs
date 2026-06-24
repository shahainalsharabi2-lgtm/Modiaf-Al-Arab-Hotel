using Modiaf.Al.Arab.Hotel.Bookings;
using Modiaf.Al.Arab.Hotel.Reservations.Repositories;
using Microsoft.Extensions.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.Modularity;

namespace Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore;

[DependsOn(
    typeof(AbpEntityFrameworkCoreModule),
    typeof(ReservationsDomainModule)
)]
public class ReservationsEntityFrameworkCoreModule : AbpModule
{
    public override void ConfigureServices(ServiceConfigurationContext context)
    {
        context.Services.AddAbpDbContext<ReservationsDbContext>(options =>
        {
            options.AddDefaultRepositories(includeAllEntities: true);
            options.AddRepository<Booking, EfCoreBookingRepository>();
        });
    }
}
