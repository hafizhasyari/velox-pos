import { transport } from '../transport';
import type { RoleType, UserAccount } from '../../types/pos';

export interface AuthSession {
  token: string;
  user: UserAccount;
  tenantName: string;
}

export const authService = {
  async login(role: RoleType): Promise<AuthSession> {
    const res = await transport.post<AuthSession>('/auth/login', { role });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Login failed');
    }
    localStorage.setItem('velox_auth_token', res.data.token);
    return res.data;
  },

  async signup(businessName: string, ownerName: string, email: string): Promise<AuthSession> {
    const res = await transport.post<AuthSession>('/auth/signup', { businessName, ownerName, email });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Signup failed');
    }
    localStorage.setItem('velox_auth_token', res.data.token);
    return res.data;
  },

  logout(): void {
    localStorage.removeItem('velox_auth_token');
  },

  async getUsers(): Promise<UserAccount[]> {
    const res = await transport.get<UserAccount[]>('/auth/users');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch users');
    }
    return res.data;
  },

  async addKasir(name: string, email: string): Promise<UserAccount[]> {
    const res = await transport.post<UserAccount[]>('/auth/users', { name, email, role: 'kasir' });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to add kasir');
    }
    return res.data;
  },

  async deleteUser(userId: string): Promise<UserAccount[]> {
    const res = await transport.delete<UserAccount[]>('/auth/users', { id: userId });
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to delete user');
    }
    return res.data;
  }
};
