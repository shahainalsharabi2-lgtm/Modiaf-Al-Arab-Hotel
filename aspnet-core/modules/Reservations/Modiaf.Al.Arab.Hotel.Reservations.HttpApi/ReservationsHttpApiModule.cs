using Volo.Abp.AspNetCore.Mvc;
using Volo.Abp.Modularity;

namespace Modiaf.Al.Arab.Hotel.Reservations;

[DependsOn(
    typeof(ReservationsApplicationContractsModule),
    typeof(AbpAspNetCoreMvcModule)
)]
public class ReservationsHttpApiModule : AbpModule;
