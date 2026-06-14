using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations.PostgreSql;

/// <inheritdoc />
public partial class Add_CreditCardTypes : Migration
{
    /// <inheritdoc />
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.CreateTable(
            name: "AppCreditCardTypes",
            columns: table => new
            {
                Id = table.Column<int>(type: "integer", nullable: false)
                    .Annotation("Npgsql:ValueGenerationStrategy", Npgsql.EntityFrameworkCore.PostgreSQL.Metadata.NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                Code = table.Column<string>(type: "character varying(32)", maxLength: 32, nullable: false),
                Name = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: false),
                ForeignName = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
                Description = table.Column<string>(type: "character varying(1024)", maxLength: 1024, nullable: true),
                DisplayOrder = table.Column<int>(type: "integer", nullable: false),
                IsActive = table.Column<bool>(type: "boolean", nullable: false),
                Bank = table.Column<string>(type: "character varying(256)", maxLength: 256, nullable: true),
            },
            constraints: table =>
            {
                table.PrimaryKey("PK_AppCreditCardTypes", x => x.Id);
            });

        migrationBuilder.CreateIndex(
            name: "IX_AppCreditCardTypes_Code",
            table: "AppCreditCardTypes",
            column: "Code",
            unique: true);
    }

    /// <inheritdoc />
    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.DropTable(name: "AppCreditCardTypes");
    }
}
