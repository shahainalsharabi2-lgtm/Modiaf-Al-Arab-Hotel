export interface GroupBookingRoomLine {
  id: string;
  roomType: string;
  count: number;
  adults: number;
  child1: number;
  child2: number;
  child3: number;
  child4: number;
  child5: number;
  extra: number;
  available: number;
  nights: number;
  totalPerPerson: number;
}

export interface GroupBookingPackageLine {
  id: string;
  code: string;
  name: string;
  quantity: number;
  total: number;
  calcMethod: string;
  calcBase: string;
}

export interface GroupBookingAdvancePolicy {
  id: string;
  policy: string;
  percent: number;
  amount: number;
  dueDate: string;
  notes: string;
}

export interface GroupBookingRoutingLine {
  id: string;
  typeKey: string;
  routingToKey: string;
  windowNo: number;
  paymentMethod: string;
  notes: string;
}

export type GroupBookingRoomCountMode = 'fixed' | 'flexible';
