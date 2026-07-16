import { transport } from '../transport';
import type { RoleType } from '../../types/pos';
import type { UserAccount } from '../mocks/mockDatabase';

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
  }
};
