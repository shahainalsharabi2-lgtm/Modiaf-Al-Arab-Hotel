export interface RoomTypeRowDto {
  id: number;
  number: number;
  code: string;
  name: string;
  foreignName: string;
  description: string;
}

export interface RoomTypeFormDto {
  id: number;
  code: string;
  name: string;
  foreignName: string;
  roomCategory: string;
  numberOfRooms: number;
  defaultCapacity: number;
  minCapacity: number;
  maxCapacity: number;
  maxAdults: number;
  maxChildren: number;
  specialNeeds: boolean;
  virtualRoom: boolean;
  meetingRoom: boolean;
  maintenanceRoom: boolean;
  suite: boolean;
  isActive: boolean;
  shortDescription: string;
  description: string;
  roomFeatures: string;
}

/** بيانات القائمة مطابقة لشاشة Ultimate — أنواع الغرف */
export const ROOM_TYPES_LIST_SEED: RoomTypeRowDto[] = [
  { id: 1, number: 1, code: 'singl', name: 'مفردة', foreignName: 'singel', description: 'singel' },
  { id: 2, number: 2, code: 'Duple', name: 'ثنائية', foreignName: 'Duple', description: 'Duple' },
  { id: 3, number: 3, code: 'Tripl', name: 'ثلاثية', foreignName: 'Triple', description: 'Triple' },
  { id: 4, number: 4, code: 'quad', name: 'رباعية', foreignName: 'quad', description: 'quad' },
  { id: 5, number: 5, code: 'quint', name: 'خماسية', foreignName: 'quintet', description: 'quintet' },
  { id: 6, number: 6, code: 'Hexa', name: 'سداسية', foreignName: 'Hexagonal', description: 'Hexagonal' },
  { id: 7, number: 7, code: 'Hepta', name: 'سباعي', foreignName: 'Heptagon', description: 'Heptagon' },
];

/** نموذج تفاصيل نوع الغرفة — quint */
export const ROOM_TYPE_FORM_SEED: RoomTypeFormDto = {
  id: 5,
  code: 'quint',
  name: 'خماسية',
  foreignName: 'quintet',
  roomCategory: 'standard',
  numberOfRooms: 10,
  defaultCapacity: 5,
  minCapacity: 1,
  maxCapacity: 6,
  maxAdults: 6,
  maxChildren: 3,
  specialNeeds: false,
  virtualRoom: false,
  meetingRoom: false,
  maintenanceRoom: false,
  suite: false,
  isActive: true,
  shortDescription: 'quintet',
  description: 'quintet',
  roomFeatures: '',
};

export function roomTypeRowToForm(row: RoomTypeRowDto): RoomTypeFormDto {
  const base = { ...ROOM_TYPE_FORM_SEED };
  return {
    ...base,
    id: row.id,
    code: row.code,
    name: row.name,
    foreignName: row.foreignName,
    shortDescription: row.description,
    description: row.description,
    defaultCapacity: row.id,
    minCapacity: 1,
    maxCapacity: row.id + 1,
    maxAdults: row.id + 1,
    maxChildren: Math.max(1, row.id - 2),
    numberOfRooms: row.id === 5 ? 10 : row.id,
  };
}

export function emptyRoomTypeForm(): RoomTypeFormDto {
  return {
    id: 0,
    code: '',
    name: '',
    foreignName: '',
    roomCategory: 'standard',
    numberOfRooms: 0,
    defaultCapacity: 1,
    minCapacity: 1,
    maxCapacity: 1,
    maxAdults: 1,
    maxChildren: 0,
    specialNeeds: false,
    virtualRoom: false,
    meetingRoom: false,
    maintenanceRoom: false,
    suite: false,
    isActive: true,
    shortDescription: '',
    description: '',
    roomFeatures: '',
  };
}
