using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Migrations;
using Modiaf.Al.Arab.Hotel.EntityFrameworkCore;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations
{
    [DbContext(typeof(HotelDbContext))]
    [Migration("20260615120000_Add_HotelAppUser_AllowNavigation")]
    /// <inheritdoc />
    public partial class Add_HotelAppUser_AllowNavigation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "AllowNavigation",
                table: "AppHotelAppUsers",
                type: "bit",
                nullable: false,
                defaultValue: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowNavigation",
                table: "AppHotelAppUsers");
        }
    }
}
