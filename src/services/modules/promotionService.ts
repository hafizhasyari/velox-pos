import { transport } from '../transport';
import type { VoucherPromo } from '../../types/pos';

export const promotionService = {
  async getPromotions(): Promise<VoucherPromo[]> {
    const res = await transport.get<VoucherPromo[]>('/promotions/list');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch promotions');
    }
    return res.data;
  },

  async validateCode(code: string, subtotal: number): Promise<VoucherPromo> {
    const res = await transport.post<VoucherPromo>('/promotions/validate', { code, subtotal });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Invalid or ineligible voucher code');
    }
    return res.data;
  },

  async savePromotion(promo: VoucherPromo): Promise<VoucherPromo[]> {
    const res = await transport.post<VoucherPromo[]>('/promotions/save', promo);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to save voucher');
    }
    return res.data;
  },

  async togglePromotion(code: string): Promise<VoucherPromo[]> {
    const res = await transport.post<VoucherPromo[]>('/promotions/toggle', { code });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to toggle voucher');
    }
    return res.data;
  },

  async deletePromotion(code: string): Promise<VoucherPromo[]> {
    const res = await transport.delete<VoucherPromo[]>('/promotions/delete', { code });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to delete voucher');
    }
    return res.data;
  }
};
