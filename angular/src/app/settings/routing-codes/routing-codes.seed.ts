export interface RoutingCodeRowDto {
  id: number;
  code: string;
  name: string;
  foreignName?: string | null;
  description?: string | null;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — رموز التوجيه */
export const ROUTING_CODES_SEED: RoutingCodeRowDto[] = [
  { id: 1, code: 'dd', name: 'توجيه لشركة', description: 'توجيه لشركة' },
  { id: 2, code: 'ss', name: 'توجيه مؤسسة', description: 'توجيه مؤسسة' },
];
