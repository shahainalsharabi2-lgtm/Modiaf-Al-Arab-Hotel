using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Modiaf.Al.Arab.Hotel.HotelChains;

public interface IHotelChainAppService
    : ICrudAppService<HotelChainDto, int, PagedAndSortedResultRequestDto, CreateUpdateHotelChainDto>
{
}
