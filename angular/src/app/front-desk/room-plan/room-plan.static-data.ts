import type { RoomPlanStaticPayload } from './room-plan.types';
import embeddedData from '../../../assets/static-data/room-plan.data.json';

export type {
  RoomPlanBuilding,
  RoomPlanFooterSummary,
  RoomPlanRoom,
  RoomPlanRoomStatus,
  RoomPlanStatCard,
  RoomPlanStatTone,
  RoomPlanStaticPayload,
} from './room-plan.types';

const data = embeddedData as RoomPlanStaticPayload;

/** بيانات ثابتة من JSON — شبكة 3×9 (102–110، 202–210، 302–310) */
export const ROOM_PLAN_STAT_ROW_1 = data.statsRow1;
export const ROOM_PLAN_STAT_ROW_2 = data.statsRow2;
export const ROOM_PLAN_BUILDINGS = data.buildings;
export const ROOM_PLAN_FLOORS = data.floors;
export const ROOM_PLAN_ROOMS = data.rooms;
export const ROOM_PLAN_FOOTER = data.footer;
