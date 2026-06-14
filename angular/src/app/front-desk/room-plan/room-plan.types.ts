export type RoomPlanStatTone =
  | 'white'
  | 'purple'
  | 'orange'
  | 'cyan'
  | 'peach'
  | 'blue'
  | 'red'
  | 'pink'
  | 'rose'
  | 'green'
  | 'yellow'
  | 'grey'
  | 'teal'
  | 'wine';

export type RoomPlanRoomStatus = 'clean' | 'dirty' | 'occupied';

export interface RoomPlanStatCard {
  key: string;
  labelKey: string;
  count: number;
  icon: string;
  tone: RoomPlanStatTone;
  /** قائمة منسدلة على عنوان البطاقة (الثلاث الأولى) */
  labelMenu?: boolean;
}

export interface RoomPlanRoom {
  id: string;
  number: string;
  typeKey: string;
  balance: number;
  status: RoomPlanRoomStatus;
  floor: number;
  buildingId: 'main' | 'a';
  hasArrival?: boolean;
  paymentDue?: boolean;
}

export interface RoomPlanBuilding {
  id: 'main' | 'a';
  labelKey: string;
  count: number;
}

export interface RoomPlanFooterSummary {
  occupancyRate: number;
  totalCredit: number;
  totalDebit: number;
  totalNet: number;
}

export interface RoomPlanStaticPayload {
  statsRow1: RoomPlanStatCard[];
  statsRow2: RoomPlanStatCard[];
  buildings: RoomPlanBuilding[];
  floors: number[];
  rooms: RoomPlanRoom[];
  footer: RoomPlanFooterSummary;
}
