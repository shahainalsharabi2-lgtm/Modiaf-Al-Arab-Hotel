using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.HotelSettings;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class HotelSettingsDocumentEntityTypeConfiguration : IEntityTypeConfiguration<HotelSettingsDocument>
{
    public void Configure(EntityTypeBuilder<HotelSettingsDocument> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "HotelSettingsDocuments", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.SettingsPassword).IsRequired().HasMaxLength(128);
        builder.Property(x => x.HotelImageDataUrl);
        builder.Property(x => x.ProfileJson).IsRequired();
        builder.Property(x => x.CurrencyId).IsRequired().HasMaxLength(32);
        builder.Property(x => x.CurrencySymbol).HasMaxLength(16);
        builder.Property(x => x.CurrencyCode).HasMaxLength(16);
    }
}
