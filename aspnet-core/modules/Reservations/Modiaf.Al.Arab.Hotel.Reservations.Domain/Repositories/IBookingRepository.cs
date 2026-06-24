using Modiaf.Al.Arab.Hotel.Bookings;
using Volo.Abp.Domain.Repositories;

namespace Modiaf.Al.Arab.Hotel.Reservations.Repositories;

public interface IBookingRepository : IRepository<Booking, int>
{
}
