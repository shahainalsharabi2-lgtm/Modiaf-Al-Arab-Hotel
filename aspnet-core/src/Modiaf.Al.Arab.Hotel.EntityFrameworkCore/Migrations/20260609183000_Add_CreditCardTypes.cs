using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations;

/// <inheritdoc />
public partial class Add_CreditCardTypes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql(
            """
            IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name = 'AppCreditCardTypes')
            BEGIN
                CREATE TABLE [AppCreditCardTypes] (
                    [Id] int NOT NULL IDENTITY,
                    [Code] nvarchar(32) NOT NULL,
                    [Name] nvarchar(256) NOT NULL,
                    [ForeignName] nvarchar(256) NULL,
                    [Description] nvarchar(1024) NULL,
                    [DisplayOrder] int NOT NULL,
                    [IsActive] bit NOT NULL,
                    [Bank] nvarchar(256) NULL,
                    CONSTRAINT [PK_AppCreditCardTypes] PRIMARY KEY ([Id])
                );
                CREATE UNIQUE INDEX [IX_AppCreditCardTypes_Code] ON [AppCreditCardTypes] ([Code]);
            END
            """);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AppCreditCardTypes");
    }
}
