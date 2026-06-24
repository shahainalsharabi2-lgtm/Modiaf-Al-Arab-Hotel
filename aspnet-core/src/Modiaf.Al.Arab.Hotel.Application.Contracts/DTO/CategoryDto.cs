using System;
using Volo.Abp.Application.Dtos;

namespace Modiaf.Al.Arab.Hotel.DTO
{
    public class CategoryDto : AuditedEntityDto<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
    }
}

