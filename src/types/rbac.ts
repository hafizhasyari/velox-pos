import type { ScreenType } from './pos';

export interface Permission {
  id: string;
  screen: ScreenType;
  label: string;
  description: string;
  icon: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSystem: boolean;
  isEditable: boolean;
  isDeletable: boolean;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoleDto {
  name: string;
  description: string;
  permissions: string[];
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
  permissions?: string[];
}

// Constants
export const MAX_ROLES_PER_TENANT = 8;
export const MIN_ROLE_NAME_LENGTH = 3;
export const MAX_ROLE_NAME_LENGTH = 50;
