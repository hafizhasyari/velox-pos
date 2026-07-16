import { transport } from '../transport';
import type { CartLine } from '../../types/pos';
import type { OrderRecord, CurrentShiftState } from '../mocks/mockDatabase';

export interface PaymentResponse {
  order: OrderRecord;
  currentShift: CurrentShiftState;
}

export const paymentService = {
  async processPayment(payload: {
    items: CartLine[];
    orderType: 'dinein' | 'takeaway';
    tableNumber: number | null;
    discountValue: number;
    discountType: 'pct' | 'rp';
    paymentMethod: 'cash' | 'qris';
    cashTendered: number;
  }): Promise<PaymentResponse> {
    const res = await transport.post<PaymentResponse>('/payments/charge', payload);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Payment failed');
    }
    return res.data;
  }
};
