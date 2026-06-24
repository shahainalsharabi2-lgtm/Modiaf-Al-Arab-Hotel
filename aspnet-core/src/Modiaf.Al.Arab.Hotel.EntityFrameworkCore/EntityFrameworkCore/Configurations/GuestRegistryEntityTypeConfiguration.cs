using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.GuestRegistries;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class GuestRegistryEntityTypeConfiguration : IEntityTypeConfiguration<GuestRegistry>
{
    public void Configure(EntityTypeBuilder<GuestRegistry> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "GuestRegistries", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.First_Name).IsRequired().HasMaxLength(128);
        builder.Property(x => x.Middle_Name).HasMaxLength(128);
        builder.Property(x => x.Last_Name).IsRequired().HasMaxLength(128);
        builder.Property(x => x.Phone_Number).HasMaxLength(32);
        builder.Property(x => x.Gender).HasMaxLength(16);
        builder.Property(x => x.Nationality).HasMaxLength(128);
        builder.Property(x => x.Country).HasMaxLength(128);
        builder.Property(x => x.Id_Type).HasMaxLength(64);
        builder.Property(x => x.Id_Issuing_Country).HasMaxLength(128);
        builder.Property(x => x.Id_Number).HasMaxLength(64);
        builder.Property(x => x.Purpose_Of_Stay).HasMaxLength(256);
        builder.Property(x => x.Relationship_Type).HasMaxLength(256);
        builder.Property(x => x.Price_Code).HasMaxLength(256);
        builder.HasIndex(x => x.Id_Number);
    }
}
