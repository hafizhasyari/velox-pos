import { transport } from '../transport';
import type { TenantConfig } from '../../types/pos';

export const configService = {
  async getTenantConfig(): Promise<TenantConfig> {
    const res = await transport.get<TenantConfig>('/config/tenant');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch tenant config');
    }
    return res.data;
  },

  async updateTenantConfig(config: Partial<TenantConfig>): Promise<TenantConfig> {
    const res = await transport.put<TenantConfig>('/config/tenant', config);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to update tenant config');
    }
    return res.data;
  }
};
