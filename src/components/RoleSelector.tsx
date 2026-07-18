import React from 'react';
import type { Role } from '../types/rbac';
import { ChevronDown } from 'lucide-react';

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
  
  const selectedRole = roles.find(r => r.id === selectedRoleId);
  
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={selectedRoleId}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        aria-label={placeholder}
        style={{
          width: '100%',
          padding: '12px 40px 12px 16px',
          border: '1px solid #D8CEBE',
          borderRadius: '10px',
          fontSize: '14px',
          color: '#241F18',
          backgroundColor: disabled ? '#F6F2EC' : '#fff',
          cursor: disabled ? 'not-allowed' : 'pointer',
          appearance: 'none',
          fontWeight: 500,
        }}
      >
        <option value="" disabled>{placeholder}</option>
        {filteredRoles.map(role => (
          <option key={role.id} value={role.id}>
            {role.name} {role.isSystem ? '(System)' : ''}
          </option>
        ))}
      </select>
      
      <ChevronDown 
        size={18} 
        color="#7C7160" 
        style={{
          position: 'absolute',
          right: '14px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none',
        }}
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
