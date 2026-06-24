using Volo.Abp.Application;
using Volo.Abp.Modularity;

namespace Modiaf.Al.Arab.Hotel.Reservations;

[DependsOn(
    typeof(AbpDddApplicationContractsModule),
    typeof(ReservationsDomainSharedModule)
)]
public class ReservationsApplicationContractsModule : AbpModule;
