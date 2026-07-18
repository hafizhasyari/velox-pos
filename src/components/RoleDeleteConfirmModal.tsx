import React from 'react';
import type { Role } from '../types/rbac';
import { AlertTriangle, X } from 'lucide-react';

interface RoleDeleteConfirmModalProps {
  isOpen: boolean;
  role: Role | null;
  userCount: number;
  onConfirm: () => void;
  onCancel: () => void;
}

export const RoleDeleteConfirmModal: React.FC<RoleDeleteConfirmModalProps> = ({
  isOpen,
  role,
  userCount,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen || !role) return null;
  
  const canDelete = userCount === 0;
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(36, 31, 24, 0.6)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px',
    }}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '480px',
        boxShadow: '0 20px 60px rgba(36, 31, 24, 0.3)',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E6DFD3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: canDelete ? '#FFF5F5' : '#FFF9F5',
              border: `1px solid ${canDelete ? '#FED7D7' : '#FFE8D4'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <AlertTriangle size={20} color={canDelete ? '#E53E3E' : '#DD6B20'} />
            </div>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#241F18', margin: 0 }}>
              {canDelete ? 'Delete Role?' : 'Cannot Delete Role'}
            </h2>
          </div>
          <button
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer',
              color: '#7C7160',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '6px',
            }}
          >
            <X size={20} />
          </button>
        </div>
        
        <div style={{ padding: '24px' }}>
          {canDelete ? (
            <>
              <p style={{ fontSize: '14px', color: '#241F18', margin: '0 0 16px 0' }}>
                Anda yakin ingin menghapus role <strong>"{role.name}"</strong>?
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
                Action ini tidak bisa di-undo. Role akan dihapus permanen dari sistem.
              </p>
            </>
          ) : (
            <>
              <p style={{ fontSize: '14px', color: '#241F18', margin: '0 0 16px 0' }}>
                Role <strong>"{role.name}"</strong> tidak bisa dihapus karena masih ada{' '}
                <strong>{userCount} user</strong> yang menggunakan role ini.
              </p>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>
                Silakan assign user-user tersebut ke role lain terlebih dahulu sebelum menghapus role ini.
              </p>
            </>
          )}
        </div>
        
        <div style={{
          padding: '20px 24px',
          borderTop: '1px solid #E6DFD3',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '12px',
        }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              borderRadius: '10px',
              border: '1px solid #D8CEBE',
              backgroundColor: '#fff',
              color: '#241F18',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {canDelete ? 'Cancel' : 'OK'}
          </button>
          {canDelete && (
            <button
              onClick={onConfirm}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'var(--color-danger-text)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Yes, Delete Role
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
