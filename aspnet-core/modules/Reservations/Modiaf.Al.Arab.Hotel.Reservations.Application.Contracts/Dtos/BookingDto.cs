using System;
using Volo.Abp.Application.Dtos;

namespace Modiaf.Al.Arab.Hotel.Bookings;

public class BookingDto : EntityDto<int>
{
    public string First_Name { get; set; } = string.Empty;
    public string Last_Name { get; set; } = string.Empty;
    public string Phone_Number { get; set; } = string.Empty;
    public decimal Payment_Amount { get; set; }
    public string Id_Number { get; set; } = string.Empty;
    public string Id_Type { get; set; } = string.Empty;
    public string Room_Type { get; set; } = string.Empty;
    public string Room_Number { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public DateTime? Booking_Date { get; set; }
    public string Booking_Time { get; set; } = string.Empty;
    public DateTime? BookingDateTime { get; set; }
    public string Payment_Method { get; set; } = string.Empty;
    public int People_Count { get; set; }
    public int Adults_Count { get; set; }
    public int Children_Count { get; set; }
    public string Invoice_Number { get; set; } = string.Empty;
    public int Stay_Days { get; set; }
    public decimal Total_Price { get; set; }
    public decimal Remaining_Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencySymbol { get; set; } = string.Empty;
    public string Guest_Notes { get; set; } = string.Empty;
    public bool Booking_Confirmed { get; set; }
    public string Booking_Source { get; set; } = string.Empty;

    /// <summary>آخر تحديث للحجز؛ يُعرض كوقت إلغاء تقريبي عند الحالة «ملغى».</summary>
    public DateTime? LastModificationTime { get; set; }
}

public class CreateUpdateBookingDto
{
    public string First_Name { get; set; } = string.Empty;
    public string Last_Name { get; set; } = string.Empty;
    public string Phone_Number { get; set; } = string.Empty;
    public decimal Payment_Amount { get; set; }
    public string Id_Number { get; set; } = string.Empty;
    public string Id_Type { get; set; } = string.Empty;
    public string Room_Type { get; set; } = string.Empty;
    public string Room_Number { get; set; } = string.Empty;
    public string Floor { get; set; } = string.Empty;
    public DateTime? Booking_Date { get; set; }
    public string Booking_Time { get; set; } = string.Empty;
    public DateTime? BookingDateTime { get; set; }
    public string Payment_Method { get; set; } = string.Empty;
    public int People_Count { get; set; }
    public int Adults_Count { get; set; }
    public int Children_Count { get; set; }
    public string Invoice_Number { get; set; } = string.Empty;
    public int Stay_Days { get; set; }
    public decimal Total_Price { get; set; }
    public decimal Remaining_Amount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string CurrencyCode { get; set; } = string.Empty;
    public string CurrencySymbol { get; set; } = string.Empty;
    public string Guest_Notes { get; set; } = string.Empty;
    public bool Booking_Confirmed { get; set; } = true;
    public string Booking_Source { get; set; } = "direct";
}
