export interface AgentCommissionRowDto {
  id: number;
  serial: number;
  planName: string;
  code: string;
  description: string;
  amountType: string;
  amount: number;
  percentage: number;
  perNight: boolean;
  perStay: boolean;
  account: string;
}

/** بيانات ثابتة مطابقة لشاشة Ultimate — خطط العمولات */
export const AGENT_COMMISSIONS_SEED: AgentCommissionRowDto[] = [
  {
    id: 1,
    serial: 1,
    planName: 'بوكينج',
    code: 'dd',
    description: 'ي',
    amountType: 'Percentage',
    amount: 0,
    percentage: 15,
    perNight: false,
    perStay: true,
    account: '',
  },
  {
    id: 2,
    serial: 2,
    planName: 'عمولات الوكلاء',
    code: '2',
    description: '',
    amountType: 'Percentage',
    amount: 0,
    percentage: 20,
    perNight: true,
    perStay: true,
    account: '',
  },
];
