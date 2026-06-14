using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations;

/// <inheritdoc />
public partial class Add_HotelChains : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AppHotelChains')
            BEGIN
                CREATE TABLE [AppHotelChains] (
                    [Id] int NOT NULL IDENTITY,
                    [Code] nvarchar(32) NOT NULL,
                    [Name] nvarchar(256) NOT NULL,
                    [ForeignName] nvarchar(256) NULL,
                    [Notes] nvarchar(1024) NULL,
                    [DisplayOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    CONSTRAINT [PK_AppHotelChains] PRIMARY KEY ([Id])
                );
                CREATE UNIQUE INDEX [IX_AppHotelChains_Code] ON [AppHotelChains] ([Code]);
            END
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AppHotelChains");
    }
}
