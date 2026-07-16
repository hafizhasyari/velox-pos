import { transport } from '../transport';
import type { KitchenTicket, KitchenTicketStatus } from '../../types/pos';

export const kitchenService = {
  async getTickets(): Promise<KitchenTicket[]> {
    const res = await transport.get<KitchenTicket[]>('/kitchen/tickets');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch kitchen tickets');
    }
    return res.data;
  },

  async updateTicketStatus(orderId: string, status: KitchenTicketStatus): Promise<KitchenTicket[]> {
    const res = await transport.patch<KitchenTicket[]>('/kitchen/status', { orderId, status });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to update kitchen ticket status');
    }
    return res.data;
  }
};
