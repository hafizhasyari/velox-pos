import React, { useState } from 'react';

interface SignupScreenProps {
  onSignup: (businessName: string) => void;
  onGoToLogin: () => void;
}

export const SignupScreen: React.FC<SignupScreenProps> = ({ onSignup, onGoToLogin }) => {
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
      alert('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      alert('Passwords do not match.');
      return;
    }
    if (!agreeTerms) {
      alert('Please agree to the Terms of Service and Privacy Policy.');
      return;
    }
    onSignup(businessName.trim());
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
          }}>Get started</div>
          <h1 style={{
            fontSize: '36px',
            lineHeight: 1.18,
            fontWeight: 600,
            margin: '0 0 16px',
            maxWidth: '380px'
          }}>Live in under 15 minutes, no assisted onboarding.</h1>
          <p style={{
            fontSize: '15px',
            lineHeight: 1.6,
            opacity: 0.85,
            maxWidth: '360px',
            margin: 0
          }}>Create your account, add your first menu items, and take your first order today.</p>
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
        backgroundColor: '#F6F2EC',
        padding: '48px 0'
      }}>
        <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 600, margin: '0 0 24px' }}>Create your account</h2>

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
                Business type
              </label>
              <select
                value={businessType}
                onChange={(e) => setBusinessType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '6px',
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
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
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
              marginBottom: '14px',
              backgroundColor: '#fff',
              color: '#241F18'
            }}
            required
          />

          <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
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
                  backgroundColor: '#fff',
                  color: '#241F18'
                }}
                required
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: '#7A7062', marginBottom: '6px' }}>
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
            color: '#7A7062',
            marginBottom: '20px',
            cursor: 'pointer',
            lineHeight: 1.4
          }}>
            <input
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              style={{ marginTop: '2px' }}
            />
            <span>I agree to the Terms of Service and Privacy Policy.</span>
          </label>

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
              cursor: 'pointer'
            }}
          >
            Create account
          </button>

          <div style={{ textAlign: 'center', marginTop: '18px', fontSize: '12.5px', color: '#7A7062' }}>
            Already have an account?{' '}
            <span
              onClick={onGoToLogin}
              style={{ color: '#C1522A', fontWeight: 600, cursor: 'pointer' }}
            >
              Sign in
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};
