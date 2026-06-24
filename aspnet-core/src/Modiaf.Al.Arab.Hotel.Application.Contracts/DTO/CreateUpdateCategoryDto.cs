using System.ComponentModel.DataAnnotations;

namespace Modiaf.Al.Arab.Hotel.DTO
{
    public class CreateUpdateCategoryDto
    {
        [Required]
        [StringLength(128)]
        public string Name { get; set; }

        [StringLength(512)]
        public string Description { get; set; }
    }
}
