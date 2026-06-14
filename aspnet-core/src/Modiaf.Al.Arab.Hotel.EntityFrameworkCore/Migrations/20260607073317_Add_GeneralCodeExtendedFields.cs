using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations
{
    /// <inheritdoc />
    public partial class Add_GeneralCodeExtendedFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "CountryDialCode",
                table: "AppGeneralCodeItems",
                type: "nvarchar(32)",
                maxLength: 32,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "FamilyBedCount",
                table: "AppGeneralCodeItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FlagImageData",
                table: "AppGeneralCodeItems",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "FlagImageName",
                table: "AppGeneralCodeItems",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RegularBedCount",
                table: "AppGeneralCodeItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RoomCount",
                table: "AppGeneralCodeItems",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CountryDialCode",
                table: "AppGeneralCodeItems");

            migrationBuilder.DropColumn(
                name: "FamilyBedCount",
                table: "AppGeneralCodeItems");

            migrationBuilder.DropColumn(
                name: "FlagImageData",
                table: "AppGeneralCodeItems");

            migrationBuilder.DropColumn(
                name: "FlagImageName",
                table: "AppGeneralCodeItems");

            migrationBuilder.DropColumn(
                name: "RegularBedCount",
                table: "AppGeneralCodeItems");

            migrationBuilder.DropColumn(
                name: "RoomCount",
                table: "AppGeneralCodeItems");
        }
    }
}
