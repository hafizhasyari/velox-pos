import React, { useState } from 'react';
import type { RoleType } from '../types/pos';

interface LoginScreenProps {
  onLogin: (role: RoleType) => void;
  onGoToSignup: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onGoToSignup }) => {
  const [loginRole, setLoginRole] = useState<RoleType>('owner');
  const [email, setEmail] = useState('owner@warungibusari.id');
  const [password, setPassword] = useState('password123');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin(loginRole);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', width: '100%' }}>
      <div style={{
        flex: 1,
        backgroundColor: '#C1522A',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '56px',
        minWidth: '420px'
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
            opacity: 0.75,
            marginBottom: '16px'
          }}>Point of Sale</div>
          <h1 style={{
            fontSize: '38px',
            lineHeight: 1.18,
            fontWeight: 600,
            margin: '0 0 16px',
            maxWidth: '380px'
          }}>Run your counter, know your numbers.</h1>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            opacity: 0.85,
            maxWidth: '360px',
            margin: 0
          }}>Order taking, shift reconciliation, and sales reporting for single-outlet F&amp;B businesses.</p>
        </div>

        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', opacity: 0.55 }}>
          Built for Indonesian UMKM F&amp;B outlets
        </div>
      </div>

      <div style={{
        flex: 1.1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F6F2EC'
      }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '360px', padding: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 28px' }}>Sign in</h2>
          
          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="owner@warungibusari.id"
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

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
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
            color: '#A79C8A',
            marginBottom: '8px'
          }}>Continue as (demo)</div>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
            <button
              type="button"
              onClick={() => setLoginRole('owner')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${loginRole === 'owner' ? '#C1522A' : '#D8CEBE'}`,
                backgroundColor: loginRole === 'owner' ? '#C1522A' : '#fff',
                color: loginRole === 'owner' ? '#fff' : '#7A7062'
              }}
            >
              Owner
            </button>
            <button
              type="button"
              onClick={() => setLoginRole('kasir')}
              style={{
                flex: 1,
                padding: '10px',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                border: `1px solid ${loginRole === 'kasir' ? '#C1522A' : '#D8CEBE'}`,
                backgroundColor: loginRole === 'kasir' ? '#C1522A' : '#fff',
                color: loginRole === 'kasir' ? '#fff' : '#7A7062'
              }}
            >
              Kasir
            </button>
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '13px',
              backgroundColor: '#C1522A',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(193, 82, 42, 0.25)'
            }}
          >
            Sign In as {loginRole === 'owner' ? 'Owner' : 'Kasir'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: '#7A7062' }}>
            New to Velox?{' '}
            <span
              onClick={onGoToSignup}
              style={{ color: '#C1522A', fontWeight: 600, cursor: 'pointer' }}
            >
              Create your outlet
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
