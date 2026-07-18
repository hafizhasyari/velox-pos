import React, { useState } from 'react';
import type { RoleType, Role } from '../types/pos';
import { useViewport } from '../hooks/useViewport';
import { AlertNotification } from './AlertNotification';
import { RoleSelector } from './RoleSelector';

interface LoginScreenProps {
  onLogin: (role: RoleType) => void;
  onGoToSignup: () => void;
  roles: Role[];
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToSignup, roles }) => {
  const { isDesktop, isMobile } = useViewport();
  const [loginRole, setLoginRole] = useState<RoleType>('owner');
  const [email, setEmail] = useState('owner@warungibusari.id');
  const [password, setPassword] = useState('password123');
  const [validationError, setValidationError] = useState<string | null>(null);

  const selectedRoleObj = roles.find(r => r.id === loginRole);
  const selectedRoleName = selectedRoleObj?.name || 'User';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);
    if (!email.trim() || !password.trim()) {
      setValidationError('Please fill out all required fields before signing in.');
      return;
    }
    onLogin(loginRole);
  };

  return (
    <div style={{ display: 'flex', flexDirection: isDesktop ? 'row' : 'column', minHeight: '100vh', width: '100%' }}>
      <div style={{
        flex: isDesktop ? 1 : 'none',
        backgroundColor: 'var(--color-velvet)',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: isDesktop ? '56px' : isMobile ? '28px 20px' : '40px 32px',
        minWidth: isDesktop ? '420px' : 'auto',
        gap: isDesktop ? '0' : '24px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '2px solid rgba(255, 255, 255, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '18px'
          }}>V</div>
          <span style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>Velox</span>
        </div>

        <div>
          <div style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '12px',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: '#F8ECE4',
            fontWeight: 600,
            marginBottom: isMobile ? '8px' : '16px'
          }}>Point of Sale</div>
          <h1 style={{
            fontSize: isDesktop ? '38px' : isMobile ? '26px' : '32px',
            lineHeight: 1.18,
            fontWeight: 600,
            margin: '0 0 16px',
            maxWidth: isDesktop ? '380px' : '100%'
          }}>Run your counter, know your numbers.</h1>
          <p style={{
            fontSize: isMobile ? '14px' : '15px',
            lineHeight: 1.6,
            color: '#F8ECE4',
            maxWidth: isDesktop ? '360px' : '100%',
            margin: 0
          }}>Order taking, shift reconciliation, and sales reporting for single-outlet F&amp;B businesses.</p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12.5px', color: '#F8ECE4', fontWeight: 500 }}>
          Built for Indonesian UMKM F&amp;B outlets
        </div>
      </div>

      <div style={{
        flex: isDesktop ? 1.1 : 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F2EC',
        padding: isDesktop ? '0' : isMobile ? '24px 16px' : '40px 24px'
      }}>
        <form noValidate onSubmit={handleSubmit} style={{
          width: '100%',
          maxWidth: isDesktop ? '360px' : '420px',
          padding: isDesktop ? '32px' : isMobile ? '24px 20px' : '32px',
          backgroundColor: isDesktop ? 'transparent' : '#fff',
          borderRadius: isDesktop ? '0' : '12px',
          border: isDesktop ? 'none' : '1px solid var(--color-border)',
          boxShadow: isDesktop ? 'none' : '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 28px' }}>Sign in</h2>
          
          {validationError && (
            <AlertNotification
              title="Missing Required Fields"
              message={validationError}
              type="error"
              onClose={() => setValidationError(null)}
            />
          )}

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setValidationError(null); }}
            placeholder="owner@warungibusari.id"
            className={validationError && !email.trim() ? 'input-error' : ''}
            style={{
              width: '100%',
              padding: '11px 12px',
              border: '1px solid #D8CEBE',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '16px',
              backgroundColor: '#fff',
              color: '#241F18'
            }}
            required
          />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setValidationError(null); }}
            placeholder="••••••••"
            className={validationError && !password.trim() ? 'input-error' : ''}
            style={{
              width: '100%',
              padding: '11px 12px',
              border: '1px solid #D8CEBE',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '22px',
              backgroundColor: '#fff',
              color: '#241F18'
            }}
            required
          />

          <div style={{
            fontSize: '11.5px',
            fontWeight: 600,
            letterSpacing: '0.03em',
            textTransform: 'uppercase',
            color: 'var(--color-placeholder)',
            marginBottom: '8px'
          }}>Continue as (demo)</div>

          <div style={{ marginBottom: '24px' }}>
            <RoleSelector
              roles={roles}
              selectedRoleId={loginRole}
              onChange={(roleId) => setLoginRole(roleId)}
              filterSystemRoles={false}
              placeholder="Pilih role..."
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: 'var(--color-velvet)',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(193, 82, 42, 0.25)'
            }}
          >
            Sign In as {selectedRoleName}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--color-muted)' }}>
            New to Velox?{' '}
            <span
              onClick={onGoToSignup}
              style={{ color: 'var(--color-velvet)', fontWeight: 600, cursor: 'pointer' }}
            >
              Create your outlet
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
