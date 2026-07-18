import React from 'react';
import type { Permission } from '../types/rbac';
import { 
  LayoutDashboard, 
  Utensils, 
  Ticket, 
  ShoppingCart, 
  ChefHat, 
  Clock, 
  Settings 
} from 'lucide-react';

interface PermissionCheckboxGridProps {
  permissions: Permission[];
  selectedPermissions: string[];
  onChange: (permissions: string[]) => void;
  disabled?: boolean;
}

const iconMap: Record<string, React.ComponentType<{ size: number }>> = {
  'LayoutDashboard': LayoutDashboard,
  'Utensils': Utensils,
  'Ticket': Ticket,
  'ShoppingCart': ShoppingCart,
  'ChefHat': ChefHat,
  'Clock': Clock,
  'Settings': Settings,
};

export const PermissionCheckboxGrid: React.FC<PermissionCheckboxGridProps> = ({
  permissions,
  selectedPermissions,
  onChange,
  disabled = false,
}) => {
  const handleToggle = (permissionId: string) => {
    if (disabled) return;
    
    if (selectedPermissions.includes(permissionId)) {
      onChange(selectedPermissions.filter(p => p !== permissionId));
    } else {
      onChange([...selectedPermissions, permissionId]);
    }
  };
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
      {permissions.map(permission => {
        const isSelected = selectedPermissions.includes(permission.id);
        const IconComponent = iconMap[permission.icon];
        
        return (
          <label
            key={permission.id}
            style={{
              display: 'flex',
              alignItems: 'start',
              gap: '12px',
              padding: '14px',
              borderRadius: '10px',
              border: `1px solid ${isSelected ? 'var(--color-velvet)' : '#E6DFD3'}`,
              backgroundColor: isSelected ? 'rgba(162, 63, 29, 0.04)' : '#fff',
              cursor: disabled ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: disabled ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = isSelected 
                  ? 'rgba(162, 63, 29, 0.08)' 
                  : '#FBF8F3';
              }
            }}
            onMouseOut={(e) => {
              if (!disabled) {
                e.currentTarget.style.backgroundColor = isSelected 
                  ? 'rgba(162, 63, 29, 0.04)' 
                  : '#fff';
              }
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(permission.id)}
              disabled={disabled}
              style={{
                width: '18px',
                height: '18px',
                marginTop: '2px',
                cursor: disabled ? 'not-allowed' : 'pointer',
                accentColor: 'var(--color-velvet)',
              }}
            />
            
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                <div style={{ color: isSelected ? 'var(--color-velvet)' : '#7C7160' }}>
                  {IconComponent && <IconComponent size={16} />}
                </div>
                <span style={{ 
                  fontSize: '14px', 
                  fontWeight: 600, 
                  color: isSelected ? 'var(--color-velvet)' : '#241F18' 
                }}>
                  {permission.label}
                </span>
              </div>
              <p style={{ 
                fontSize: '12px', 
                color: 'var(--color-muted)', 
                margin: 0 
              }}>
                {permission.description}
              </p>
            </div>
          </label>
        );
      })}
    </div>
  );
};
