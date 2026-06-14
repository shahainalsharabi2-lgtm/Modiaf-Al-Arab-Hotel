export type HkRoomInspectionItemSortKey =
  | 'rowNo'
  | 'itemName'
  | 'foreignName'
  | 'category'
  | 'fineAmount'
  | 'defaultQuantity'
  | 'displayOrder';

export type HkRoomInspectionItemSortDir = 'asc' | 'desc';

export interface HkRoomInspectionItemRow {
  id: string;
  rowNo: number;
  itemName: string;
  foreignName: string;
  category: string;
  fineAmount: number;
  defaultQuantity: number;
  displayOrder: number;
}
