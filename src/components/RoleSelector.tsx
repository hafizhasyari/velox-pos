import React from 'react';
import type { Role } from '../types/rbac';
import { CustomSelect, type OptionItem } from './CustomSelect';

interface RoleSelectorProps {
  roles: Role[];
  selectedRoleId: string;
  onChange: (roleId: string) => void;
  filterSystemRoles?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  roles,
  selectedRoleId,
  onChange,
  filterSystemRoles = false,
  disabled = false,
  placeholder = 'Pilih role...'
}) => {
  const filteredRoles = filterSystemRoles
    ? roles.filter(r => !r.isSystem)
    : roles;

  const options: OptionItem[] = filteredRoles.map(role => ({
    value: role.id,
    label: role.isSystem ? `${role.name} (System)` : role.name
  }));

  const selectedRole = filteredRoles.find(r => r.id === selectedRoleId);

  return (
    <div>
      <CustomSelect
        value={selectedRoleId}
        onChange={onChange}
        options={options}
        placeholder={placeholder}
        disabled={disabled}
      />

      {selectedRole && (
        <div style={{
          marginTop: '8px',
          fontSize: '12px',
          color: 'var(--color-muted)',
          padding: '8px 12px',
          backgroundColor: '#FBF8F3',
          borderRadius: '6px',
          border: '1px solid #E6DFD3',
        }}>
          {selectedRole.description}
        </div>
      )}
    </div>
  );
};
