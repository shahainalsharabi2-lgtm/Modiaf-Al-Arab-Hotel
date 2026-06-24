using System;

namespace Modiaf.Al.Arab.Hotel.HotelUsers;

/// <summary>حساب صاحب النظام المخفي — لا يُخزَّن في قاعدة البيانات.</summary>
public static class HotelSystemOwner
{
    public const string UserName = "Shaheen123";

    public const string Password = "Shaheen123";

    public const int SessionId = 0;

    public static bool IsUserName(string? userName) =>
        string.Equals((userName ?? string.Empty).Trim(), UserName, StringComparison.OrdinalIgnoreCase);
}
