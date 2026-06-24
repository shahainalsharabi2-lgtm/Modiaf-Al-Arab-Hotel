using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.UiTranslations;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class UiTranslationsStoreEntityTypeConfiguration : IEntityTypeConfiguration<UiTranslationsStore>
{
    public void Configure(EntityTypeBuilder<UiTranslationsStore> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "UiTranslationsStores", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
    }
}
