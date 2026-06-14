using Volo.Abp.Application.Dtos;

namespace Modiaf.Al.Arab.Hotel.HotelChains;

public class HotelChainDto : EntityDto<int>
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? ForeignName { get; set; }

    public string? Notes { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }
}
