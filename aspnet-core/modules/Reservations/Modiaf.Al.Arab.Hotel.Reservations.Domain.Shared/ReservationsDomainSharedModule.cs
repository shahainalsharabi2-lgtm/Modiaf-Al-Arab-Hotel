using Volo.Abp.Modularity;
using Volo.Abp.Validation;

namespace Modiaf.Al.Arab.Hotel.Reservations;

[DependsOn(typeof(AbpValidationModule))]
public class ReservationsDomainSharedModule : AbpModule;
