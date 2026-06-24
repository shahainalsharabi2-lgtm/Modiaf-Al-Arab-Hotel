using Modiaf.Al.Arab.Hotel.Floors;
using Modiaf.Al.Arab.Hotel.IdentityTypes;
using Modiaf.Al.Arab.Hotel.Rooms;
using Modiaf.Al.Arab.Hotel.RoomTypes;
using Riok.Mapperly.Abstractions;
using Volo.Abp.Mapperly;

namespace Modiaf.Al.Arab.Hotel;

[Mapper]
public partial class HotelApplicationMappers
{
    /* Rooms — DTO بدون حقول التدقيق */
    [MapperIgnoreSource(nameof(Room.IsDeleted))]
    [MapperIgnoreSource(nameof(Room.DeleterId))]
    [MapperIgnoreSource(nameof(Room.DeletionTime))]
    [MapperIgnoreSource(nameof(Room.LastModificationTime))]
    [MapperIgnoreSource(nameof(Room.LastModifierId))]
    [MapperIgnoreSource(nameof(Room.CreationTime))]
    [MapperIgnoreSource(nameof(Room.CreatorId))]
    public partial RoomDto MapToDto(Room room);

    [MapperIgnoreTarget(nameof(Room.IsDeleted))]
    [MapperIgnoreTarget(nameof(Room.DeleterId))]
    [MapperIgnoreTarget(nameof(Room.DeletionTime))]
    [MapperIgnoreTarget(nameof(Room.LastModificationTime))]
    [MapperIgnoreTarget(nameof(Room.LastModifierId))]
    [MapperIgnoreTarget(nameof(Room.CreationTime))]
    [MapperIgnoreTarget(nameof(Room.CreatorId))]
    public partial Room MapToEntity(CreateUpdateRoomDto dto);

    /* Floors — FloorDto يرث FullAuditedEntityDto */
    public partial FloorDto MapToDto(Floor floor);

    [MapperIgnoreTarget(nameof(Floor.IsDeleted))]
    [MapperIgnoreTarget(nameof(Floor.DeleterId))]
    [MapperIgnoreTarget(nameof(Floor.DeletionTime))]
    [MapperIgnoreTarget(nameof(Floor.LastModificationTime))]
    [MapperIgnoreTarget(nameof(Floor.LastModifierId))]
    [MapperIgnoreTarget(nameof(Floor.CreationTime))]
    [MapperIgnoreTarget(nameof(Floor.CreatorId))]
    public partial Floor MapToEntity(CreateUpdateFloorDto dto);

    /* IdentityTypes */
    public partial IdentityTypeDto MapToDto(IdentityType identityType);
    public partial IdentityType MapToEntity(CreateUpdateIdentityTypeDto dto);

    /* RoomTypes */
    public partial RoomTypeDto MapToDto(RoomType roomType);
    public partial RoomType MapToEntity(CreateUpdateRoomTypeDto dto);
}
