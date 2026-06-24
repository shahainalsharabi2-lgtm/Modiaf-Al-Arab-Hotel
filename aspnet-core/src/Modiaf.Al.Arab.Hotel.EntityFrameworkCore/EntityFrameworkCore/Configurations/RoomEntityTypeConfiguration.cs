using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.Rooms;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class RoomEntityTypeConfiguration : IEntityTypeConfiguration<Room>
{
    public void Configure(EntityTypeBuilder<Room> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "Rooms", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.RoomNumber).IsRequired().HasMaxLength(50);
        builder.Property(x => x.RoomView).HasMaxLength(256);
        builder.Property(x => x.RoomArchitecture).HasMaxLength(256);
        builder.Property(x => x.RoomLocation).HasMaxLength(256);
        builder.Property(x => x.RoomFeatures).HasMaxLength(2048);
        builder.Property(x => x.MaintenanceReason).HasMaxLength(256);
        builder.Property(x => x.CurrencyCode).HasMaxLength(16).HasDefaultValue("YER");
        builder.Property(x => x.CurrencySymbol).HasMaxLength(16).HasDefaultValue("YR");
    }
}
