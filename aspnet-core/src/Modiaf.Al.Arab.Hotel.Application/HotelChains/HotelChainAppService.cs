using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Volo.Abp.Application.Dtos;
using Volo.Abp.Application.Services;
using Volo.Abp.Domain.Repositories;
using Volo.Abp.Linq;

namespace Modiaf.Al.Arab.Hotel.HotelChains;

[AllowAnonymous]
public class HotelChainAppService(IRepository<HotelChain, int> repository)
    : CrudAppService<HotelChain, HotelChainDto, int, PagedAndSortedResultRequestDto, CreateUpdateHotelChainDto>(repository),
        IHotelChainAppService
{
    public override async Task<PagedResultDto<HotelChainDto>> GetListAsync(PagedAndSortedResultRequestDto input)
    {
        var queryable = await Repository.GetQueryableAsync();
        var total = await AsyncExecuter.CountAsync(queryable);
        var entities = await AsyncExecuter.ToListAsync(
            queryable
                .OrderBy(x => x.DisplayOrder)
                .ThenBy(x => x.Name)
                .PageBy(input.SkipCount, input.MaxResultCount));
        return new PagedResultDto<HotelChainDto>(
            total,
            entities.Select(MapToGetOutputDto).ToList());
    }

    protected override HotelChainDto MapToGetOutputDto(HotelChain entity)
    {
        return new HotelChainDto
        {
            Id = entity.Id,
            Code = entity.Code,
            Name = entity.Name,
            ForeignName = entity.ForeignName,
            Notes = entity.Notes,
            DisplayOrder = entity.DisplayOrder,
            IsActive = entity.IsActive,
        };
    }

    protected override HotelChain MapToEntity(CreateUpdateHotelChainDto createInput)
    {
        return new HotelChain(
            createInput.Code.Trim().ToUpperInvariant(),
            createInput.Name.Trim(),
            string.IsNullOrWhiteSpace(createInput.ForeignName) ? null : createInput.ForeignName.Trim(),
            string.IsNullOrWhiteSpace(createInput.Notes) ? null : createInput.Notes.Trim(),
            createInput.DisplayOrder,
            createInput.IsActive);
    }

    protected override void MapToEntity(CreateUpdateHotelChainDto updateInput, HotelChain entity)
    {
        entity.Code = updateInput.Code.Trim().ToUpperInvariant();
        entity.Name = updateInput.Name.Trim();
        entity.ForeignName = string.IsNullOrWhiteSpace(updateInput.ForeignName) ? null : updateInput.ForeignName.Trim();
        entity.Notes = string.IsNullOrWhiteSpace(updateInput.Notes) ? null : updateInput.Notes.Trim();
        entity.DisplayOrder = updateInput.DisplayOrder;
        entity.IsActive = updateInput.IsActive;
    }
}
