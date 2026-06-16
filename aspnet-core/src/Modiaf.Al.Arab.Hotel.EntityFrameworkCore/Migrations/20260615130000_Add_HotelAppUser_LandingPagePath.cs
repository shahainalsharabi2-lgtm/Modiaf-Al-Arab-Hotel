using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Modiaf.Al.Arab.Hotel.EntityFrameworkCore;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations
{
    [DbContext(typeof(HotelDbContext))]
    [Migration("20260615130000_Add_HotelAppUser_LandingPagePath")]
    /// <inheritdoc />
    public partial class Add_HotelAppUser_LandingPagePath : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LandingPagePath",
                table: "AppHotelAppUsers",
                type: "nvarchar(512)",
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
