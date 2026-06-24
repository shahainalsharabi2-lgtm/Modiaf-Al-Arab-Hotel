using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.HotelChains;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class HotelChainEntityTypeConfiguration : IEntityTypeConfiguration<HotelChain>
{
    public void Configure(EntityTypeBuilder<HotelChain> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "HotelChains", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.Code).IsRequired().HasMaxLength(32);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        builder.Property(x => x.ForeignName).HasMaxLength(256);
        builder.Property(x => x.Notes).HasMaxLength(1024);
        builder.HasIndex(x => x.Code).IsUnique();
    }
}
