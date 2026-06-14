using System.ComponentModel.DataAnnotations;

namespace Modiaf.Al.Arab.Hotel.CreditCardTypes;

public class CreateUpdateCreditCardTypeDto
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
    public string? Description { get; set; }

    public int DisplayOrder { get; set; }

    public bool IsActive { get; set; } = true;

    [StringLength(256)]
    public string? Bank { get; set; }
}
