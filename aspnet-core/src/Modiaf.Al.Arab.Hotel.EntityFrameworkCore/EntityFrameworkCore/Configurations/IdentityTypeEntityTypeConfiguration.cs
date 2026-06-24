using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.IdentityTypes;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class IdentityTypeEntityTypeConfiguration : IEntityTypeConfiguration<IdentityType>
{
    public void Configure(EntityTypeBuilder<IdentityType> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "IdentityTypes", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.Name).IsRequired().HasMaxLength(100);
    }
}
