import { transport } from '../transport';
import type { TableItem } from '../../types/pos';

export const orderService = {
  async getTables(): Promise<TableItem[]> {
    const res = await transport.get<TableItem[]>('/orders/tables');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to load tables');
    }
    return res.data;
  },

  async lockTable(tableNumber: number): Promise<TableItem | null> {
    const res = await transport.post<TableItem | null>(`/orders/tables/${tableNumber}/lock`);
    if (res.error) {
      throw new Error(res.error);
    }
    return res.data;
  }
};
