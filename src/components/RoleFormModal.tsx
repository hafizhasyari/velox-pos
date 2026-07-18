import React, { useState, useEffect } from 'react';
import type { Role, Permission, CreateRoleDto } from '../types/rbac';
import { X, Save } from 'lucide-react';
import { PermissionCheckboxGrid } from './PermissionCheckboxGrid';
import { validateRoleName } from '../utils/permissionHelper';
import { MAX_ROLES_PER_TENANT } from '../types/rbac';

interface RoleFormModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  role?: Role;
  roles: Role[];
  permissions: Permission[];
  currentRoleCount: number;
  onClose: () => void;
  onSubmit: (data: CreateRoleDto) => Promise<void>;
}

export const RoleFormModal: React.FC<RoleFormModalProps> = ({
  isOpen,
  mode,
  role,
  roles,
  permissions,
  currentRoleCount,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && role) {
        setName(role.name);
        setDescription(role.description);
        setSelectedPermissions(role.permissions);
      } else {
        setName('');
        setDescription('');
        setSelectedPermissions([]);
      }
      setError(null);
    }
  }, [isOpen, mode, role]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (mode === 'create' && currentRoleCount >= MAX_ROLES_PER_TENANT) {
      setError(`Maksimal ${MAX_ROLES_PER_TENANT} roles per tenant`);
      return;
    }
    
    const nameError = validateRoleName(
      name, 
      roles.filter(r => mode === 'edit' ? r.id !== role?.id : true)
    );
    if (nameError) {
      setError(nameError);
      return;
    }
    
    if (selectedPermissions.length === 0) {
      setError('Pilih minimal 1 permission');
      return;
    }
    
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        permissions: selectedPermissions,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan role');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isOpen) return null;
  
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
        maxWidth: '600px',
        maxHeight: '90vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(36, 31, 24, 0.3)',
      }}>
        <div style={{
          padding: '24px',
          borderBottom: '1px solid #E6DFD3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#241F18', margin: 0 }}>
            {mode === 'create' ? '✨ Create New Role' : '✏️ Edit Role'}
          </h2>
          <button
            onClick={onClose}
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
              transition: 'background-color 0.2s ease',
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#F6F2EC'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px', minHeight: 0 }}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-muted)',
                marginBottom: '8px',
              }}>
                ROLE NAME *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Manager, Kitchen Staff, Supervisor"
                required
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#241F18',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-muted)',
                marginBottom: '8px',
              }}>
                DESCRIPTION
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Deskripsi singkat tentang role ini..."
                rows={2}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '10px',
                  fontSize: '14px',
                  color: '#241F18',
                  resize: 'vertical',
                  fontFamily: 'inherit',
                }}
              />
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--color-muted)',
                marginBottom: '8px',
              }}>
                PERMISSIONS * (Select screens to allow)
              </label>
              <PermissionCheckboxGrid
                permissions={permissions}
                selectedPermissions={selectedPermissions}
                onChange={setSelectedPermissions}
                disabled={isSubmitting}
              />
              <div style={{
                marginTop: '10px',
                fontSize: '12px',
                color: '#7C7160',
              }}>
                Selected: {selectedPermissions.length} of {permissions.length} permissions
              </div>
            </div>
            
            {error && (
              <div style={{
                padding: '12px 14px',
                borderRadius: '8px',
                backgroundColor: '#FFF5F5',
                border: '1px solid #FED7D7',
                color: 'var(--color-danger-text)',
                fontSize: '13px',
                marginTop: '16px',
              }}>
                ⚠️ {error}
              </div>
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
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              style={{
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid #D8CEBE',
                backgroundColor: '#fff',
                color: '#241F18',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '10px 24px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isSubmitting ? '#B89B82' : 'var(--color-velvet)',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Save size={16} />
              {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
