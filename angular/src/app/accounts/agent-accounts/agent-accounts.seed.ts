export interface AgentAccountRowDto {
  id: number;
  agentName: string;
  totalCommissionsDue: number;
  totalCommissionsPaid: number;
  balance: number;
  status: 'open' | 'closed' | 'settled';
}

/** بيانات ثابتة — حسابات الوكلاء (فارغة كما في Ultimate) */
export const AGENT_ACCOUNTS_SEED: AgentAccountRowDto[] = [];
