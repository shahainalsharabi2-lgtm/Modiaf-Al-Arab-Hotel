using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Modiaf.Al.Arab.Hotel.Migrations
{
    /// <inheritdoc />
    public partial class Add_GuestAndRoomCodingFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RoomArchitecture",
                table: "AppRooms",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomFeatures",
                table: "AppRooms",
                type: "nvarchar(2048)",
                maxLength: 2048,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomLocation",
                table: "AppRooms",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RoomView",
                table: "AppRooms",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Price_Code",
                table: "AppGuestRegistries",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Purpose_Of_Stay",
                table: "AppGuestRegistries",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Relationship_Type",
                table: "AppGuestRegistries",
                type: "nvarchar(256)",
                maxLength: 256,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RoomArchitecture",
                table: "AppRooms");

            migrationBuilder.DropColumn(
                name: "RoomFeatures",
                table: "AppRooms");

            migrationBuilder.DropColumn(
                name: "RoomLocation",
                table: "AppRooms");

            migrationBuilder.DropColumn(
                name: "RoomView",
                table: "AppRooms");

            migrationBuilder.DropColumn(
                name: "Price_Code",
                table: "AppGuestRegistries");

            migrationBuilder.DropColumn(
                name: "Purpose_Of_Stay",
                table: "AppGuestRegistries");

            migrationBuilder.DropColumn(
                name: "Relationship_Type",
                table: "AppGuestRegistries");
        }
    }
}
