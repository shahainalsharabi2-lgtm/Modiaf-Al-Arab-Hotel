using Volo.Abp.Application;
using Volo.Abp.Modularity;

namespace Modiaf.Al.Arab.Hotel.Reservations;

[DependsOn(
    typeof(AbpDddApplicationModule),
    typeof(ReservationsDomainModule),
    typeof(ReservationsApplicationContractsModule)
)]
public class ReservationsApplicationModule : AbpModule;
