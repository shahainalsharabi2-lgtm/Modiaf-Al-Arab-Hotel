using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;

namespace Modiaf.Al.Arab.Hotel.CreditCardTypes;

public interface ICreditCardTypeAppService
    : ICrudAppService<CreditCardTypeDto, int, PagedAndSortedResultRequestDto, CreateUpdateCreditCardTypeDto>
{
}
