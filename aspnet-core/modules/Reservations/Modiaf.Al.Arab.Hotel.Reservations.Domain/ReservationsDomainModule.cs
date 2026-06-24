using Volo.Abp.Domain;
using Volo.Abp.Modularity;

namespace Modiaf.Al.Arab.Hotel.Reservations;

[DependsOn(
    typeof(AbpDddDomainModule),
    typeof(ReservationsDomainSharedModule)
)]
public class ReservationsDomainModule : AbpModule;
