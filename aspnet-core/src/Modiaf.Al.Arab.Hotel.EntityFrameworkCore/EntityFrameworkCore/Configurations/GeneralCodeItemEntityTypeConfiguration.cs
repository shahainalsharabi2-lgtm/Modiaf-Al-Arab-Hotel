using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.GeneralCodes;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class GeneralCodeItemEntityTypeConfiguration : IEntityTypeConfiguration<GeneralCodeItem>
{
    public void Configure(EntityTypeBuilder<GeneralCodeItem> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "GeneralCodeItems", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.Category).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        builder.Property(x => x.FName).HasMaxLength(256);
        builder.Property(x => x.Description).HasMaxLength(1024);
        builder.Property(x => x.CountryDialCode).HasMaxLength(32);
        builder.Property(x => x.FlagImageName).HasMaxLength(256);
        builder.Property(x => x.FlagImageData).HasColumnType("text");
        builder.Property(x => x.RoomCount);
        builder.Property(x => x.RegularBedCount);
        builder.Property(x => x.FamilyBedCount);
        builder.HasIndex(x => x.Category);
    }
}
