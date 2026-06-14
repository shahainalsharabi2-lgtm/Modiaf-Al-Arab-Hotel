using Volo.Abp.Domain.Entities;

namespace Modiaf.Al.Arab.Hotel.HotelChains;

public class HotelChain : Entity<int>
{
    public string Code { get; set; } = string.Empty;

    public string Name { get; set; } = string.Empty;

    public string? ForeignName { get; set; }

    public string? Notes { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    protected HotelChain()
    {
    }

    public HotelChain(
        string code,
        string name,
        string? foreignName,
        string? notes,
        int displayOrder,
        bool isActive)
    {
        Code = code;
        Name = name;
        ForeignName = foreignName;
        Notes = notes;
        DisplayOrder = displayOrder;
        IsActive = isActive;
    }
}
