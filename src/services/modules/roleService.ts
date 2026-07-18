import { transport } from '../transport';
import type { Role, Permission, CreateRoleDto, UpdateRoleDto } from '../../types/rbac';

export const roleService = {
  /**
   * Get all roles for current tenant
   */
  async getRoles(): Promise<Role[]> {
    const res = await transport.get<Role[]>('/roles');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch roles');
    }
    return res.data;
  },

  /**
   * Get single role by ID
   */
  async getRole(id: string): Promise<Role> {
    const res = await transport.get<Role>(`/roles/${id}`);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch role');
    }
    return res.data;
  },

  /**
   * Create new role
   */
  async createRole(data: CreateRoleDto): Promise<Role> {
    const res = await transport.post<Role>('/roles', data);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to create role');
    }
    return res.data;
  },

  /**
   * Update existing role
   */
  async updateRole(id: string, data: UpdateRoleDto): Promise<Role> {
    const res = await transport.put<Role>(`/roles/${id}`, data);
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to update role');
    }
    return res.data;
  },

  /**
   * Delete role
   */
  async deleteRole(id: string): Promise<void> {
    const res = await transport.delete(`/roles/${id}`);
    if (res.error) {
      throw new Error(res.error);
    }
  },

  /**
   * Get all available permissions
   */
  async getPermissions(): Promise<Permission[]> {
    const res = await transport.get<Permission[]>('/permissions');
    if (res.error || !res.data) {
      throw new Error(res.error || 'Failed to fetch permissions');
    }
    return res.data;
  },
};
