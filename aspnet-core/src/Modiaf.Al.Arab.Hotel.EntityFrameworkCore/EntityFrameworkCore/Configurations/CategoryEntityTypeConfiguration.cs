using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.Categories;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class CategoryEntityTypeConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "Categories", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(128);
        builder.Property(x => x.Description).HasMaxLength(512);
    }
}
