namespace Modiaf.Al.Arab.Hotel.HotelAuth;

public class HotelAppUserPublicDto
{
    public int Id { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string UserName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string PhoneNumber { get; set; } = string.Empty;

    public string Role { get; set; } = string.Empty;

    public bool AllowNavigation { get; set; } = true;

    public string LandingPagePath { get; set; } = "/dashboard";

    public bool DenyUserManagement { get; set; }

    public bool IsSystemOwner { get; set; }
}
