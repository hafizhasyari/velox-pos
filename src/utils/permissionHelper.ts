import type { Role, Permission } from '../types/rbac';
import { MIN_ROLE_NAME_LENGTH, MAX_ROLE_NAME_LENGTH } from '../types/rbac';
import type { UserAccount, ScreenType } from '../types/pos';

/**
 * Get role by ID from roles array
 */
export const getRoleById = (roleId: string, roles: Role[]): Role | undefined => {
  return roles.find(r => r.id === roleId);
};

/**
 * Get user's role object
 */
export const getUserRole = (user: UserAccount | undefined | null, roles: Role[]): Role | undefined => {
  if (!user) return undefined;
  return getRoleById(user.roleId, roles);
};

/**
 * Check if user has permission to access a screen
 */
export const hasPermission = (
  user: UserAccount | undefined | null, 
  roles: Role[], 
  screen: ScreenType
): boolean => {
  const role = getUserRole(user, roles);
  if (!role) return false;
  
  // Owner always has access
  if (role.id === 'owner') return true;
  
  return role.permissions.includes(screen);
};

/**
 * Check if role can access screen
 */
export const canAccessScreen = (
  roleId: string, 
  screen: ScreenType, 
  roles: Role[]
): boolean => {
  const role = getRoleById(roleId, roles);
  if (!role) return false;
  
  if (role.id === 'owner') return true;
  
  return role.permissions.includes(screen);
};

/**
 * Get allowed screens for a role
 */
export const getAllowedScreens = (roleId: string, roles: Role[]): ScreenType[] => {
  const role = getRoleById(roleId, roles);
  if (!role) return [];
  return role.permissions as ScreenType[];
};

/**
 * Get permission labels for display
 */
export const getPermissionLabels = (
  permissions: string[], 
  allPermissions: Permission[]
): string[] => {
  return permissions
    .map(p => allPermissions.find(ap => ap.id === p))
    .filter(Boolean)
    .map(p => p!.label);
};

/**
 * Validate role name
 */
export const validateRoleName = (name: string, existingRoles: Role[]): string | null => {
  if (name.length < MIN_ROLE_NAME_LENGTH) {
    return `Role name harus minimal ${MIN_ROLE_NAME_LENGTH} karakter`;
  }
  if (name.length > MAX_ROLE_NAME_LENGTH) {
    return `Role name maksimal ${MAX_ROLE_NAME_LENGTH} karakter`;
  }
  
  const duplicate = existingRoles.find(
    r => r.name.toLowerCase() === name.toLowerCase()
  );
  if (duplicate) {
    return 'Role dengan nama ini sudah ada';
  }
  
  return null;
};

/**
 * Check if can delete role (no users assigned)
 */
export const canDeleteRole = (
  roleId: string, 
  users: UserAccount[], 
  roles: Role[]
): { canDelete: boolean; reason?: string; userCount?: number } => {
  const role = getRoleById(roleId, roles);
  
  if (!role) {
    return { canDelete: false, reason: 'Role tidak ditemukan' };
  }
  
  if (!role.isDeletable) {
    return { canDelete: false, reason: 'Role sistem tidak dapat dihapus' };
  }
  
  const usersWithRole = users.filter(u => u.roleId === roleId);
  if (usersWithRole.length > 0) {
    return { 
      canDelete: false, 
      reason: `${usersWithRole.length} user masih menggunakan role ini`,
      userCount: usersWithRole.length
    };
  }
  
  return { canDelete: true };
};
