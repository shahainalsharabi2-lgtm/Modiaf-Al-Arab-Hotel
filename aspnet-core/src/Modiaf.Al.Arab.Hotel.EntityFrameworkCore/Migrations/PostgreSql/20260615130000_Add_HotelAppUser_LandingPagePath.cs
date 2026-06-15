using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations
{
    /// <inheritdoc />
    public partial class Add_HotelAppUser_LandingPagePath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LandingPagePath",
                table: "AppHotelAppUsers",
                type: "character varying(512)",
                maxLength: 512,
                nullable: false,
                defaultValue: "/dashboard");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LandingPagePath",
                table: "AppHotelAppUsers");
        }
    }
}
