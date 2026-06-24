using Microsoft.EntityFrameworkCore;
using Volo.Abp.AuditLogging.EntityFrameworkCore;
using Volo.Abp.BackgroundJobs.EntityFrameworkCore;
using Volo.Abp.Data;
using Volo.Abp.DependencyInjection;
using Volo.Abp.EntityFrameworkCore;
using Volo.Abp.FeatureManagement.EntityFrameworkCore;
using Volo.Abp.Identity;
using Volo.Abp.Identity.EntityFrameworkCore;
using Volo.Abp.OpenIddict.EntityFrameworkCore;
using Volo.Abp.PermissionManagement.EntityFrameworkCore;
using Volo.Abp.SettingManagement.EntityFrameworkCore;
using Volo.Abp.TenantManagement;
using Volo.Abp.TenantManagement.EntityFrameworkCore;

using Modiaf.Al.Arab.Hotel.Bookings;
using Modiaf.Al.Arab.Hotel.Categories;
using Modiaf.Al.Arab.Hotel.Reservations.EntityFrameworkCore;
using Modiaf.Al.Arab.Hotel.GuestRegistries;
using Modiaf.Al.Arab.Hotel.IdentityTypes;
using Modiaf.Al.Arab.Hotel.Rooms;
using Modiaf.Al.Arab.Hotel.Floors;
using Modiaf.Al.Arab.Hotel.RoomTypes;
using Modiaf.Al.Arab.Hotel.GeneralCodes;
using Modiaf.Al.Arab.Hotel.HotelSettings;
using Modiaf.Al.Arab.Hotel.HotelUsers;
using Modiaf.Al.Arab.Hotel.CreditCardTypes;
using Modiaf.Al.Arab.Hotel.HotelChains;
using Modiaf.Al.Arab.Hotel.PaymentMethods;
using Modiaf.Al.Arab.Hotel.UiTranslations;
using Volo.Abp.EntityFrameworkCore.Modeling;

namespace Modiaf.Al.Arab.Hotel.EntityFrameworkCore;


[ReplaceDbContext(typeof(IIdentityDbContext))]
[ReplaceDbContext(typeof(ITenantManagementDbContext))]
[ReplaceDbContext(typeof(IReservationsDbContext))]
[ConnectionStringName("Default")]
public class HotelDbContext(DbContextOptions<HotelDbContext> options) :
    AbpDbContext<HotelDbContext>(options),
    IIdentityDbContext,
    ITenantManagementDbContext,
    IReservationsDbContext
{
    /* Add DbSet properties for your Aggregate Roots / Entities here. */

    #region Entities from the modules

    /* Notice: We only implemented IIdentityDbContext and ITenantManagementDbContext
     * and replaced them for this DbContext. This allows you to perform JOIN
     * queries for the entities of these modules over the repositories easily. You
     * typically don't need that for other modules. But, if you need, you can
     * implement the DbContext interface of the needed module and use ReplaceDbContext
     * attribute just like IIdentityDbContext and ITenantManagementDbContext.
     *
     * More info: Replacing a DbContext of a module ensures that the related module
     * uses this DbContext on runtime. Otherwise, it will use its own DbContext class.
     */

    //Identity
    public DbSet<IdentityUser> Users { get; set; }
    public DbSet<IdentityRole> Roles { get; set; }
    public DbSet<IdentityClaimType> ClaimTypes { get; set; }
    public DbSet<OrganizationUnit> OrganizationUnits { get; set; }
    public DbSet<IdentitySecurityLog> SecurityLogs { get; set; }
    public DbSet<IdentityLinkUser> LinkUsers { get; set; }
    public DbSet<IdentityUserDelegation> UserDelegations { get; set; }
    public DbSet<IdentitySession> Sessions { get; set; }
    // Tenant Management
    public DbSet<Tenant> Tenants { get; set; }
    public DbSet<TenantConnectionString> TenantConnectionStrings { get; set; }

    public DbSet<Room> Rooms { get; set; }
    public DbSet<Booking> Bookings { get; set; }
    public DbSet<IdentityType> IdentityTypes { get; set; }
    public DbSet<GuestRegistry> GuestRegistries { get; set; }
    public DbSet<Floor> Floors { get; set; }
    public DbSet<RoomType> RoomTypes { get; set; }
    public DbSet<UiTranslationsStore> UiTranslationsStores { get; set; }
    public DbSet<GeneralCodeItem> GeneralCodeItems { get; set; }
    public DbSet<PaymentMethod> PaymentMethods { get; set; }
    public DbSet<HotelChain> HotelChains { get; set; }
    public DbSet<CreditCardType> CreditCardTypes { get; set; }
    public DbSet<HotelAppUser> HotelAppUsers { get; set; }
    public DbSet<HotelSettingsDocument> HotelSettingsDocuments { get; set; }
    public DbSet<Category> Categories { get; set; }

    #endregion

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        /* Include modules to your migration db context */

        builder.ConfigurePermissionManagement();
        builder.ConfigureSettingManagement();
        builder.ConfigureBackgroundJobs();
        builder.ConfigureAuditLogging();
        builder.ConfigureIdentity();
        builder.ConfigureOpenIddict();
        builder.ConfigureFeatureManagement();
        builder.ConfigureTenantManagement();

        builder.ConfigureReservations();

        builder.ApplyConfiguration(new Configurations.RoomEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.IdentityTypeEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.GuestRegistryEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.FloorEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.RoomTypeEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.UiTranslationsStoreEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.GeneralCodeItemEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.PaymentMethodEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.HotelChainEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.CreditCardTypeEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.HotelAppUserEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.HotelSettingsDocumentEntityTypeConfiguration());
        builder.ApplyConfiguration(new Configurations.CategoryEntityTypeConfiguration());
    }
}

