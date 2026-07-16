import { transport } from '../transport';
import type { Category, MenuItem } from '../../types/pos';

export const catalogService = {
  async getCategories(): Promise<Category[]> {
    const res = await transport.get<Category[]>('/catalog');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to load catalog');
    }
    return res.data;
  },

  async saveCategory(name: string): Promise<Category> {
    const res = await transport.post<Category>('/catalog/categories', { name });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to save category');
    }
    return res.data;
  },

  async saveItem(item: MenuItem): Promise<MenuItem> {
    const res = await transport.post<MenuItem>('/catalog/items', item);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to save menu item');
    }
    return res.data;
  },

  async toggleArchiveItem(itemId: string): Promise<MenuItem> {
    const res = await transport.patch<MenuItem>(`/catalog/items/${itemId}/toggle-archive`);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to toggle archive status');
    }
    return res.data;
  }
};
