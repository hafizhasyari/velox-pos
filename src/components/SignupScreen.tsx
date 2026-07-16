import React, { useState } from 'react';
import { useViewport } from '../hooks/useViewport';
import { AlertNotification } from './AlertNotification';

interface SignupScreenProps {
  onSignup: (businessName: string) => void;
  onGoToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignup, onGoToLogin }) => {
  const { isDesktop, isMobile } = useViewport();
  const [alertInfo, setAlertInfo] = useState<{ title: string; message: string; type?: 'error' | 'warning' } | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [businessType, setBusinessType] = useState('Warung');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName.trim() || !ownerName.trim() || !email.trim() || !password) {
      setAlertInfo({
        title: 'Missing Required Fields',
        message: 'Please fill in your Business Name, Owner Full Name, Email, and Password before continuing.',
        type: 'error'
      });
      return;
    }
    if (password !== confirmPassword) {
      setAlertInfo({
        title: 'Password Mismatch',
        message: 'The confirm password field does not match the password you entered. Please double-check both fields.',
        type: 'error'
      });
      return;
    }
    if (!agreeTerms) {
      setAlertInfo({
        title: 'Terms of Service Required',
        message: 'Please check the box below to agree to the Terms of Service and Privacy Policy before creating your outlet account.',
        type: 'warning'
      });
      return;
    }
    setAlertInfo(null);
    onSignup(businessName.trim());
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
          }}>Get started</div>
          <h1 style={{
            fontSize: isDesktop ? '36px' : isMobile ? '24px' : '30px',
            lineHeight: 1.18,
            fontWeight: 600,
            margin: '0 0 16px',
            maxWidth: isDesktop ? '380px' : '100%'
          }}>Live in under 15 minutes, no assisted onboarding.</h1>
          <p style={{
            fontSize: isMobile ? '14px' : '15px',
            lineHeight: 1.6,
            color: '#F8ECE4',
            maxWidth: isDesktop ? '360px' : '100%',
            margin: 0
          }}>Create your account, add your first menu items, and take your first order today.</p>
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
        padding: isDesktop ? '48px 0' : isMobile ? '24px 16px' : '40px 24px'
      }}>
        <form onSubmit={handleSubmit} style={{
          width: '100%',
          maxWidth: isDesktop ? '400px' : '480px',
          padding: isDesktop ? '32px' : isMobile ? '24px 20px' : '32px',
          backgroundColor: isDesktop ? 'transparent' : '#fff',
          borderRadius: isDesktop ? '0' : '12px',
          border: isDesktop ? 'none' : '1px solid var(--color-border)',
          boxShadow: isDesktop ? 'none' : '0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 24px' }}>Create your account</h2>

          {alertInfo && (
            <AlertNotification
              title={alertInfo.title}
              message={alertInfo.message}
              type={alertInfo.type}
              onClose={() => setAlertInfo(null)}
            />
          )}

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
            Business / outlet name
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="Warung Makan Ibu Sari"
            style={{
              width: '100%',
              padding: '11px 12px',
              border: '1px solid #D8CEBE',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '14px',
              backgroundColor: '#fff',
              color: '#241F18'
            }}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                Business type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '7px',
                  fontSize: '13.5px',
                  backgroundColor: '#fff',
                  color: '#241F18'
                }}
              >
                <option value="Warung">Warung</option>
                <option value="Kafe">Kafe</option>
                <option value="Restoran">Restoran</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                Owner full name
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ibu Sari"
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '6px',
                  fontSize: '13.5px',
                  backgroundColor: '#fff',
                  color: '#241F18'
                }}
                required
              />
            </div>
          </div>

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
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
              marginBottom: '14px',
              backgroundColor: '#fff',
              color: '#241F18'
            }}
            required
          />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
            Phone number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62 812 3456 7890"
            style={{
              width: '100%',
              padding: '11px 12px',
              border: '1px solid #D8CEBE',
              borderRadius: '6px',
              fontSize: '14px',
              marginBottom: '14px',
              backgroundColor: '#fff',
              color: '#241F18'
            }}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
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
                  backgroundColor: '#fff',
                  color: '#241F18'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                Confirm password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '6px',
                  fontSize: '14px',
                  backgroundColor: '#fff',
                  color: '#241F18'
                }}
                required
              />
            </div>
          </div>

          <label style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            fontSize: '12.5px',
            color: 'var(--color-muted)',
            marginBottom: '20px',
            cursor: 'pointer',
            lineHeight: 1.4,
            padding: alertInfo?.title === 'Terms of Service Required' ? '10px 12px' : '0',
            backgroundColor: alertInfo?.title === 'Terms of Service Required' ? '#FFF8F3' : 'transparent',
            borderRadius: '6px',
            border: alertInfo?.title === 'Terms of Service Required' ? '1.5px solid #993C15' : '1.5px solid transparent',
            transition: 'all 0.25s ease'
          }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => {
                setAgreeTerms(e.target.checked);
                if (alertInfo?.title === 'Terms of Service Required' && e.target.checked) {
                  setAlertInfo(null);
                }
              }}
              style={{ marginTop: '2px' }}
            />
            <span style={{ fontWeight: alertInfo?.title === 'Terms of Service Required' ? 600 : 400, color: alertInfo?.title === 'Terms of Service Required' ? '#993C15' : 'var(--color-muted)' }}>
              I agree to the Terms of Service and Privacy Policy.
            </span>
          </label>

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
              cursor: 'pointer'
            }}
          >
            Create account
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: 'var(--color-muted)' }}>
            Already have an account?{' '}
            <span
              onClick={onGoToLogin}
              style={{ color: 'var(--color-velvet)', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
