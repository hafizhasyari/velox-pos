import React, { useState } from 'react';
import type { Role, Permission, CreateRoleDto, UpdateRoleDto } from '../types/rbac';
import type { UserAccount } from '../types/pos';
import { RoleCard } from './RoleCard';
import { RoleFormModal } from './RoleFormModal';
import { RoleDeleteConfirmModal } from './RoleDeleteConfirmModal';
import { Plus, Shield } from 'lucide-react';
import { MAX_ROLES_PER_TENANT } from '../types/rbac';

interface RoleManagementTabProps {
  roles: Role[];
  permissions: Permission[];
  users: UserAccount[];
  onCreateRole: (data: CreateRoleDto) => Promise<Role>;
  onUpdateRole: (id: string, data: UpdateRoleDto) => Promise<Role>;
  onDeleteRole: (id: string) => Promise<void>;
}

export const RoleManagementTab: React.FC<RoleManagementTabProps> = ({
  roles,
  permissions,
  users,
  onCreateRole,
  onUpdateRole,
  onDeleteRole,
}) => {
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedRole, setSelectedRole] = useState<Role | undefined>();
  
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<Role | null>(null);
  
  const getUserCount = (roleId: string): number => {
    return users.filter(u => u.roleId === roleId).length;
  };
  
  const handleCreateClick = () => {
    if (roles.length >= MAX_ROLES_PER_TENANT) {
      alert(`Maksimal ${MAX_ROLES_PER_TENANT} roles per tenant`);
      return;
    }
    setFormMode('create');
    setSelectedRole(undefined);
    setIsFormModalOpen(true);
  };
  
  const handleEditClick = (role: Role) => {
    setFormMode('edit');
    setSelectedRole(role);
    setIsFormModalOpen(true);
  };
  
  const handleDeleteClick = (role: Role) => {
    setRoleToDelete(role);
    setIsDeleteModalOpen(true);
  };
  
  const handleFormSubmit = async (data: CreateRoleDto) => {
    if (formMode === 'create') {
      await onCreateRole(data);
    } else if (selectedRole) {
      await onUpdateRole(selectedRole.id, data);
    }
  };
  
  const handleDeleteConfirm = async () => {
    if (roleToDelete) {
      await onDeleteRole(roleToDelete.id);
      setIsDeleteModalOpen(false);
      setRoleToDelete(null);
    }
  };
  
  const canCreateMore = roles.length < MAX_ROLES_PER_TENANT;
  
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '24px', alignItems: 'start' }}>
      <div>
        <div style={{ 
          backgroundColor: '#fff', 
          border: '1px solid #E6DFD3', 
          borderRadius: '14px', 
          overflow: 'hidden', 
          boxShadow: '0 1px 4px rgba(36,31,24,0.04)' 
        }}>
          <div style={{ 
            padding: '20px 24px', 
            borderBottom: '1px solid #F0EAE1', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ 
                width: '38px', 
                height: '38px', 
                borderRadius: '10px', 
                backgroundColor: '#FBF3EE', 
                border: '1px solid #ECD9CC', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center' 
              }}>
                <Shield size={18} color="var(--color-velvet)" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#241F18' }}>
                  Roles & Permissions
                </div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '1px' }}>
                  {roles.length} of {MAX_ROLES_PER_TENANT} roles configured
                </div>
              </div>
            </div>
            
            <button
              onClick={handleCreateClick}
              disabled={!canCreateMore}
              style={{
                padding: '10px 18px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: canCreateMore ? 'var(--color-velvet)' : '#D8CEBE',
                color: '#fff',
                fontSize: '13px',
                fontWeight: 600,
                cursor: canCreateMore ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s ease',
                opacity: canCreateMore ? 1 : 0.6,
              }}
              title={canCreateMore ? 'Create new role' : `Max ${MAX_ROLES_PER_TENANT} roles reached`}
            >
              <Plus size={16} />
              Create New Role
            </button>
          </div>
          
          <div style={{ padding: '16px' }}>
            {roles.length === 0 ? (
              <div style={{ 
                padding: '60px 24px', 
                textAlign: 'center', 
                color: 'var(--color-muted)', 
                fontSize: '14px' 
              }}>
                Belum ada roles. Klik "Create New Role" untuk memulai.
              </div>
            ) : (
              roles.map(role => (
                <RoleCard
                  key={role.id}
                  role={role}
                  userCount={getUserCount(role.id)}
                  permissions={permissions}
                  onEdit={handleEditClick}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </div>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{
          backgroundColor: '#fff',
          border: '1px solid #E6DFD3',
          borderRadius: '14px',
          padding: '20px',
          boxShadow: '0 1px 4px rgba(36,31,24,0.04)',
        }}>
          <h3 style={{ 
            fontSize: '14px', 
            fontWeight: 700, 
            color: '#241F18', 
            margin: '0 0 12px 0' 
          }}>
            📖 Tentang Roles
          </h3>
          <p style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted)', 
            margin: '0 0 10px 0', 
            lineHeight: 1.5 
          }}>
            Role menentukan akses user ke halaman/menu tertentu dalam sistem POS.
          </p>
          <ul style={{ 
            fontSize: '12px', 
            color: 'var(--color-muted)', 
            margin: 0, 
            paddingLeft: '18px', 
            lineHeight: 1.6 
          }}>
            <li>Setiap user harus punya 1 role</li>
            <li>Role bisa punya multiple permissions</li>
            <li>Owner role tidak bisa diubah/dihapus</li>
            <li>Max {MAX_ROLES_PER_TENANT} roles per tenant</li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: '#FFF9F5',
          border: '1px solid #FFE8D4',
          borderRadius: '14px',
          padding: '16px',
        }}>
          <h4 style={{ 
            fontSize: '13px', 
            fontWeight: 700, 
            color: '#DD6B20', 
            margin: '0 0 10px 0' 
          }}>
            ⚠️ Best Practices
          </h4>
          <ul style={{ 
            fontSize: '11px', 
            color: '#975A16', 
            margin: 0, 
            paddingLeft: '16px', 
            lineHeight: 1.5 
          }}>
            <li>Berikan akses minimal sesuai kebutuhan</li>
            <li>Review role secara berkala</li>
            <li>Jangan share login antar user</li>
            <li>Role "Settings" hanya untuk admin</li>
          </ul>
        </div>
        
        <div style={{
          backgroundColor: '#F6F2EC',
          border: '1px solid #E6DFD3',
          borderRadius: '14px',
          padding: '16px',
        }}>
          <h4 style={{ 
            fontSize: '13px', 
            fontWeight: 700, 
            color: '#241F18', 
            margin: '0 0 12px 0' 
          }}>
            📊 Quick Stats
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              fontSize: '12px', 
              color: '#5A5248', 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <span>Total Roles:</span>
              <strong>{roles.length}/{MAX_ROLES_PER_TENANT}</strong>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#5A5248', 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <span>Total Users:</span>
              <strong>{users.length}</strong>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#5A5248', 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <span>Permissions:</span>
              <strong>{permissions.length}</strong>
            </div>
            <div style={{ 
              fontSize: '12px', 
              color: '#5A5248', 
              display: 'flex', 
              justifyContent: 'space-between' 
            }}>
              <span>Custom Roles:</span>
              <strong>{roles.filter(r => !r.isSystem).length}</strong>
            </div>
          </div>
        </div>
      </div>
      
      <RoleFormModal
        isOpen={isFormModalOpen}
        mode={formMode}
        role={selectedRole}
        roles={roles}
        permissions={permissions}
        currentRoleCount={roles.length}
        onClose={() => setIsFormModalOpen(false)}
        onSubmit={handleFormSubmit}
      />
      
      <RoleDeleteConfirmModal
        isOpen={isDeleteModalOpen}
        role={roleToDelete}
        userCount={roleToDelete ? getUserCount(roleToDelete.id) : 0}
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setRoleToDelete(null);
        }}
      />
    </div>
  );
};
