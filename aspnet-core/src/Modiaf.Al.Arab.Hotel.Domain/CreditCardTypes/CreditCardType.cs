using Volo.Abp.Domain.Entities;

namespace Modiaf.Al.Arab.Hotel.CreditCardTypes;

public class CreditCardType : Entity<int>
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? ForeignName { get; set; }

    public string? Description { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    public string? Bank { get; set; }

    protected CreditCardType()
    {
    }

    public CreditCardType(
        string code,
        string name,
        string? foreignName,
        string? description,
        int displayOrder,
        bool isActive,
        string? bank)
    {
        Code = code;
        Name = name;
        ForeignName = foreignName;
        Description = description;
        DisplayOrder = displayOrder;
        IsActive = isActive;
        Bank = bank;
    }
}
