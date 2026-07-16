import { transport } from '../transport';
import type { OrderRecord } from '../mocks/mockDatabase';

export interface DashboardKPIsResponse {
  period: string;
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  recentOrders: OrderRecord[];
}

export const analyticsService = {
  async getKPIs(period: 'today' | '7d' | '30d'): Promise<DashboardKPIsResponse> {
    const res = await transport.get<DashboardKPIsResponse>(`/analytics/kpis?period=${period}`);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to load analytics KPIs');
    }
    return res.data;
  }
};
