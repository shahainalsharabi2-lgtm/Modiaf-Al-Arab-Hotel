export interface MarketCodeRowDto {
  id: number;
  code: number;
  name: string;
  foreignName: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — رموز السوق */
export const MARKET_CODES_SEED: MarketCodeRowDto[] = [
  { id: 1, code: 1, name: 'بيزنس', foreignName: 'Business', sortOrder: 1, isActive: true },
  { id: 2, code: 2, name: 'Booking.com', foreignName: 'Booking.com', sortOrder: 2, isActive: true },
  { id: 3, code: 3, name: 'Expedia', foreignName: 'Expedia', sortOrder: 3, isActive: true },
  { id: 4, code: 4, name: 'Agoda', foreignName: 'Agoda', sortOrder: 4, isActive: true },
];
