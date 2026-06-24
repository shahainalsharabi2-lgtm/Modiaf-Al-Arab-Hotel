using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Modiaf.Al.Arab.Hotel.HotelUsers;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore.Configurations;

public class HotelAppUserEntityTypeConfiguration : IEntityTypeConfiguration<HotelAppUser>
{
    public void Configure(EntityTypeBuilder<HotelAppUser> builder)
    {
        builder.ToTable(HotelConsts.DbTablePrefix + "HotelAppUsers", HotelConsts.DbSchema);
        builder.ConfigureByConvention();
        builder.Property(x => x.FirstName).IsRequired().HasMaxLength(128);
        builder.Property(x => x.LastName).IsRequired().HasMaxLength(128);
        builder.Property(x => x.UserName).IsRequired().HasMaxLength(64);
        builder.Property(x => x.Email).HasMaxLength(256);
        builder.Property(x => x.PhoneNumber).HasMaxLength(32);
        builder.Property(x => x.Password).IsRequired().HasMaxLength(128);
        builder.Property(x => x.Role).IsRequired().HasMaxLength(32).HasDefaultValue(HotelUserRoles.Default);
        builder.Property(x => x.AllowNavigation).IsRequired().HasDefaultValue(true);
        builder.Property(x => x.LandingPagePath).IsRequired().HasMaxLength(512).HasDefaultValue("/dashboard");
        builder.Property(x => x.DenyUserManagement).IsRequired().HasDefaultValue(true);
        builder.HasIndex(x => x.UserName).IsUnique();
    }
}
