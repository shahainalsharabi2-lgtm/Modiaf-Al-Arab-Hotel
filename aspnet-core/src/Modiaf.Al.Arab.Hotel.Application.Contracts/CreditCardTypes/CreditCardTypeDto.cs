using Volo.Abp.Application.Dtos;

namespace Modiaf.Al.Arab.Hotel.CreditCardTypes;

public class CreditCardTypeDto : EntityDto<int>
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? ForeignName { get; set; }

    public string? Description { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; }

    public string? Bank { get; set; }
}
