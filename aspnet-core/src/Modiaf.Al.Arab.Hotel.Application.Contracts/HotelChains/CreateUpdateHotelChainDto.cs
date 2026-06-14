using System.ComponentModel.DataAnnotations;

namespace Modiaf.Al.Arab.Hotel.HotelChains;

public class CreateUpdateHotelChainDto
{
    [Required]
    [StringLength(32)]
    public string Code { get; set; } = string.Empty;

    [Required]
    [StringLength(256)]
    public string Name { get; set; } = string.Empty;

    [StringLength(256)]
    public string? ForeignName { get; set; }

    [StringLength(1024)]
    public string? Notes { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;
}
