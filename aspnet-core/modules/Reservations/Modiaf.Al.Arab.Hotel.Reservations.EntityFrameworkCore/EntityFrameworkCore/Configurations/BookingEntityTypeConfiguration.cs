using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.Bookings;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore.Configurations;

public class BookingEntityTypeConfiguration : IEntityTypeConfiguration<Booking>
{
    public void Configure(EntityTypeBuilder<Booking> builder)
    {
        builder.ToTable(ReservationsConsts.DbTablePrefix + "Bookings", ReservationsConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.CurrencyCode).HasMaxLength(16).HasDefaultValue("YER");
        builder.Property(x => x.CurrencySymbol).HasMaxLength(16).HasDefaultValue("YR");
    }
}
