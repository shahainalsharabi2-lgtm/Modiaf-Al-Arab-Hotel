using System;
using Volo.Abp.Domain.Entities.Auditing;

namespace Modiaf.Al.Arab.Hotel.Categories
{
    public class Category : FullAuditedAggregateRoot<Guid>
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        protected Category()
        {
        }

        public Category(Guid id, string name, string? description = null)
            : base(id)
        {
            Name = name;
            Description = description;
        }
    }
}

