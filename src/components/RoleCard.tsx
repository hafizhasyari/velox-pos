import React from 'react';
import type { Role, Permission } from '../types/rbac';
import { Edit2, Trash2, Lock, Users as UsersIcon } from 'lucide-react';
import { getPermissionLabels } from '../utils/permissionHelper';

interface RoleCardProps {
  role: Role;
  userCount: number;
  permissions: Permission[];
  onEdit: (role: Role) => void;
  onDelete: (role: Role) => void;
}

export const RoleCard: React.FC<RoleCardProps> = ({
  role,
  userCount,
  permissions,
  onEdit,
  onDelete,
}) => {
  const permissionLabels = getPermissionLabels(role.permissions, permissions);
  
  return (
    <div style={{
      backgroundColor: '#fff',
      border: '1px solid #E6DFD3',
      borderRadius: '14px',
      padding: '20px',
      marginBottom: '12px',
      boxShadow: '0 1px 4px rgba(36,31,24,0.04)',
      transition: 'box-shadow 0.2s ease',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#241F18', margin: 0 }}>
              {role.name}
            </h3>
            {role.isSystem && (
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                padding: '3px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                textTransform: 'uppercase',
                backgroundColor: 'rgba(162, 63, 29, 0.1)',
                color: 'var(--color-velvet)',
                border: '1px solid rgba(162, 63, 29, 0.2)',
              }}>
                <Lock size={10} />
                System
              </span>
            )}
          </div>
          
          <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: '0 0 12px 0' }}>
            {role.description}
          </p>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: '#7C7160' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <UsersIcon size={14} />
              {userCount} user{userCount !== 1 ? 's' : ''}
            </span>
            <span>
              📋 {role.permissions.length} permission{role.permissions.length !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
          {role.isEditable && (
            <button
              onClick={() => onEdit(role)}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #D8CEBE',
                backgroundColor: '#fff',
                color: 'var(--color-velvet)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#FBF8F3';
                e.currentTarget.style.borderColor = 'var(--color-velvet)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#fff';
                e.currentTarget.style.borderColor = '#D8CEBE';
              }}
            >
              <Edit2 size={14} />
              Edit
            </button>
          )}
          
          {role.isDeletable && (
            <button
              onClick={() => onDelete(role)}
              disabled={userCount > 0}
              style={{
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px solid #E6DFD3',
                backgroundColor: userCount > 0 ? '#F6F2EC' : '#fff',
                color: userCount > 0 ? '#B0A594' : 'var(--color-danger-text)',
                fontSize: '13px',
                fontWeight: 600,
                cursor: userCount > 0 ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s ease',
                opacity: userCount > 0 ? 0.6 : 1,
              }}
              title={userCount > 0 ? `Tidak bisa dihapus - ${userCount} user menggunakan role ini` : 'Hapus role'}
              onMouseOver={(e) => {
                if (userCount === 0) {
                  e.currentTarget.style.backgroundColor = '#FFF5F5';
                  e.currentTarget.style.borderColor = 'var(--color-danger-text)';
                }
              }}
              onMouseOut={(e) => {
                if (userCount === 0) {
                  e.currentTarget.style.backgroundColor = '#fff';
                  e.currentTarget.style.borderColor = '#E6DFD3';
                }
              }}
            >
              <Trash2 size={14} />
              Delete
            </button>
          )}
        </div>
      </div>
      
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        paddingTop: '12px',
        borderTop: '1px solid #F0EAE1',
      }}>
        {permissionLabels.map(label => (
          <span
            key={label}
            style={{
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              backgroundColor: '#F6F2EC',
              color: '#5A5248',
              border: '1px solid #E6DFD3',
            }}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};
