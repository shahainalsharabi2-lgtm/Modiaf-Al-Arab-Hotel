using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Linq;

namespace Modiaf.Al.Arab.Hotel.CreditCardTypes;

[AllowAnonymous]
public class CreditCardTypeAppService(IRepository<CreditCardType, int> repository)
    : CrudAppService<CreditCardType, CreditCardTypeDto, int, PagedAndSortedResultRequestDto, CreateUpdateCreditCardTypeDto>(repository),
        ICreditCardTypeAppService
{
    public override async Task<PagedResultDto<CreditCardTypeDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await Repository.GetQueryableAsync();
        var total = await AsyncExecuter.CountAsync(queryable);
        var entities = await AsyncExecuter.ToListAsync(
            queryable
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.Name)
                .PageBy(input.SkipCount, input.MaxResultCount));
        return new PagedResultDto<CreditCardTypeDto>(
            total,
            entities.Select(MapToGetOutputDto).ToList());
    }

    protected override CreditCardTypeDto MapToGetOutputDto(CreditCardType entity)
    {
        return new CreditCardTypeDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            ForeignName = entity.ForeignName,
            Description = entity.Description,
            DisplayOrder = entity.DisplayOrder,
            IsActive = entity.IsActive,
            Bank = entity.Bank,
        };
    }

    protected override CreditCardType MapToEntity(CreateUpdateCreditCardTypeDto createInput)
    {
        return new CreditCardType(
            createInput.Code.Trim().ToUpperInvariant(),
            createInput.Name.Trim(),
            TrimOrNull(createInput.ForeignName),
            TrimOrNull(createInput.Description),
            createInput.DisplayOrder,
            createInput.IsActive,
            TrimOrNull(createInput.Bank));
    }

    protected override void MapToEntity(CreateUpdateCreditCardTypeDto updateInput, CreditCardType entity)
    {
        entity.Code = updateInput.Code.Trim().ToUpperInvariant();
        entity.Name = updateInput.Name.Trim();
        entity.ForeignName = TrimOrNull(updateInput.ForeignName);
        entity.Description = TrimOrNull(updateInput.Description);
        entity.DisplayOrder = updateInput.DisplayOrder;
        entity.IsActive = updateInput.IsActive;
        entity.Bank = TrimOrNull(updateInput.Bank);
    }

    private static string? TrimOrNull(string? value)
    {
        var trimmed = value?.Trim();
        return string.IsNullOrWhiteSpace(trimmed) ? null : trimmed;
    }
}
