export type RoomOccupancyStatus = 'occupied' | 'available';
export type RoomHousekeepingStatus = 'clean' | 'dirty';

export interface RoomRowDto {
  id: number;
  roomNumber: number;
  name: string;
  roomType: string;
  foreignName: string;
  occupancyStatus: RoomOccupancyStatus;
  housekeepingStatus: RoomHousekeepingStatus;
  isComposite: boolean;
  compositeDetails?: string | null;
}

export interface RoomFormDto {
  id: number;
  building: string;
  floor: string;
  name: string;
  foreignName: string;
  roomType: string;
  roomDesign: string;
  roomLocation: string;
  roomNumber: string;
  isVirtual: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — الغرف */
export const ROOMS_SEED: RoomRowDto[] = [
  {
    id: 1,
    roomNumber: 101,
    name: 'غرفة 101',
    roomType: 'رباعية',
    foreignName: 'Room101',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'clean',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 2,
    roomNumber: 102,
    name: 'غرفة 102',
    roomType: 'خماسية',
    foreignName: 'Room102',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'dirty',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 3,
    roomNumber: 103,
    name: 'غرفة 103',
    roomType: 'رباعية',
    foreignName: 'Room103',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'clean',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 4,
    roomNumber: 104,
    name: 'غرفة 104',
    roomType: 'خماسية',
    foreignName: 'Room104',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'dirty',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 5,
    roomNumber: 105,
    name: 'غرفة 105',
    roomType: 'رباعية',
    foreignName: 'Room105',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'clean',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 6,
    roomNumber: 106,
    name: 'غرفة 106',
    roomType: 'خماسية',
    foreignName: 'Room106',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'clean',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 7,
    roomNumber: 107,
    name: 'غرفة 107',
    roomType: 'رباعية',
    foreignName: 'Room107',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'dirty',
    isComposite: false,
    compositeDetails: null,
  },
  {
    id: 8,
    roomNumber: 108,
    name: 'غرفة 108',
    roomType: 'خماسية',
    foreignName: 'Room108',
    occupancyStatus: 'occupied',
    housekeepingStatus: 'clean',
    isComposite: false,
    compositeDetails: null,
  },
];

export function emptyRoomForm(): RoomFormDto {
  return {
    id: 0,
    building: '1',
    floor: '',
    name: '',
    foreignName: '',
    roomType: 'single',
    roomDesign: '',
    roomLocation: '',
    roomNumber: '',
    isVirtual: false,
  };
}

export interface RoomImportExportRowDto {
  id: number;
  selected: boolean;
  name: string;
  foreignName: string;
  roomNumber: string;
  building: string;
  roomType: string;
  floor: string;
  isVirtual: boolean;
  roomStatus: string;
  housekeepingStatus: string;
  bedCount: string;
  phoneNumber: string;
  error: string;
  details: string;
}

export function roomRowToForm(row: RoomRowDto): RoomFormDto {
  return {
    id: row.id,
    building: '1',
    floor: String(Math.floor(row.roomNumber / 100)),
    name: row.name,
    foreignName: row.foreignName,
    roomType: row.roomType === 'مفردة' ? 'single' : row.roomType === 'رباعية' ? 'quad' : 'quint',
    roomDesign: '',
    roomLocation: '',
    roomNumber: String(row.roomNumber),
    isVirtual: false,
  };
}
