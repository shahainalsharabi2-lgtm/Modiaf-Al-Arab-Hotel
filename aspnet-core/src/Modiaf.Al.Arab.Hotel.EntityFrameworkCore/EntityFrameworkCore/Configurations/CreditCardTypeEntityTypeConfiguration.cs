using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.CreditCardTypes;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class CreditCardTypeEntityTypeConfiguration : IEntityTypeConfiguration<CreditCardType>
{
    public void Configure(EntityTypeBuilder<CreditCardType> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "CreditCardTypes", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.Code).IsRequired().HasMaxLength(32);
        builder.Property(x => x.Name).IsRequired().HasMaxLength(256);
        builder.Property(x => x.ForeignName).HasMaxLength(256);
        builder.Property(x => x.Description).HasMaxLength(1024);
        builder.Property(x => x.Bank).HasMaxLength(256);
        builder.HasIndex(x => x.Code).IsUnique();
    }
}
