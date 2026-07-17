import React from 'react';
import type { ScreenType, RoleType } from '../types/pos';
import { LayoutDashboard, Utensils, ShoppingCart, Clock, LogOut, ChefHat, Ticket, Settings } from 'lucide-react';
import { useViewport } from '../hooks/useViewport';

interface SidebarProps {
  screen: ScreenType;
  role: RoleType;
  tenantName: string;
  onNavigate: (screen: ScreenType) => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  screen,
  role,
  tenantName,
  onNavigate,
  onLogout
}) => {
  const { isMobile, isTablet } = useViewport();
  const isKasirLocked = role === 'kasir';

  const navItems = [
    { id: 'dashboard' as ScreenType, label: 'Dashboard', icon: LayoutDashboard, locked: isKasirLocked },
    { id: 'menu' as ScreenType, label: 'Menu', icon: Utensils, locked: isKasirLocked },
    { id: 'promotions' as ScreenType, label: 'Vouchers / Promo', icon: Ticket, locked: isKasirLocked },
    { id: 'pos' as ScreenType, label: 'Order / POS', icon: ShoppingCart, locked: false },
    { id: 'kds' as ScreenType, label: 'KDS / Kitchen', icon: ChefHat, locked: false },
    { id: 'shift' as ScreenType, label: 'Shift', icon: Clock, locked: false },
    { id: 'settings' as ScreenType, label: 'Settings', icon: Settings, locked: isKasirLocked },
  ];

  const visibleNavItems = navItems.filter(item => !item.locked);

  if (isMobile) {
    return (
      <>
        {/* Mobile Top Header */}
        <header style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '56px',
          backgroundColor: '#FBF8F3',
          borderBottom: '1px solid #E6DFD3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          zIndex: 100
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '26px',
              height: '26px',
              borderRadius: '6px',
              backgroundColor: 'var(--color-velvet)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontWeight: 700,
              fontSize: '14px'
            }}>
              V
            </div>
            <span style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>Velox</span>
            <span style={{ fontSize: '11px', color: 'var(--color-placeholder)', backgroundColor: '#E6DFD3', padding: '2px 6px', borderRadius: '4px', textTransform: 'capitalize' }}>
              {role}
            </span>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 10px',
              background: 'none',
              border: '1px solid #E6DFD3',
              borderRadius: '6px',
              fontSize: '11.5px',
              color: 'var(--color-muted)',
              cursor: 'pointer'
            }}
          >
            <LogOut size={13} />
            <span>Out</span>
          </button>
        </header>

        {/* Mobile Bottom Navigation Bar */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          height: '64px',
          backgroundColor: '#FBF8F3',
          borderTop: '1px solid #E6DFD3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-around',
          padding: '0 4px',
          zIndex: 100
        }}>
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = screen === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '2px',
                  flex: 1,
                  height: '100%',
                  border: 'none',
                  backgroundColor: 'transparent',
                  color: isActive ? 'var(--color-velvet)' : 'var(--color-muted)',
                  cursor: 'pointer'
                }}
              >
                <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
                <span style={{ fontSize: '10px', fontWeight: isActive ? 700 : 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '58px' }}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      </>
    );
  }

  return (
    <aside style={{
      width: isTablet ? '68px' : '216px',
      backgroundColor: '#FBF8F3',
      borderRight: '1px solid #E6DFD3',
      display: 'flex',
      flexDirection: 'column',
      padding: isTablet ? '20px 8px' : '20px 14px',
      flexShrink: 0,
      transition: 'width 0.2s ease, padding 0.2s ease'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: isTablet ? 'center' : 'flex-start', gap: '8px', padding: isTablet ? '8px 0 26px' : '8px 8px 26px' }}>
        <div style={{
          width: '28px',
          height: '28px',
          borderRadius: '7px',
          backgroundColor: 'var(--color-velvet)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontWeight: 700,
          fontSize: '15px',
          flexShrink: 0
        }}>
          V
        </div>
        {!isTablet && <span style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.01em' }}>Velox</span>}
      </div>

      <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = screen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: isTablet ? 'center' : 'flex-start',
                gap: '10px',
                padding: isTablet ? '10px 0' : '10px 12px',
                borderRadius: '7px',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: isActive ? 600 : 500,
                cursor: 'pointer',
                textAlign: 'left',
                backgroundColor: isActive ? '#F3E3D8' : 'transparent',
                color: isActive ? 'var(--color-velvet)' : 'var(--color-muted)'
              }}
              title={isTablet ? item.label : ''}
            >
              <Icon size={18} strokeWidth={isActive ? 2.2 : 1.8} style={{ flexShrink: 0 }} />
              {!isTablet && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>

      <div style={{ borderTop: '1px solid #E6DFD3', paddingTop: '14px', marginTop: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isTablet ? 'center' : 'flex-start', gap: '8px', padding: isTablet ? '6px 0 12px' : '6px 8px 12px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-velvet)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '12px',
            fontWeight: 600,
            flexShrink: 0
          }}>
            {role === 'owner' ? 'O' : 'K'}
          </div>
          {!isTablet && (
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, textTransform: 'capitalize' }}>
                {role}
              </div>
              <div style={{ fontSize: '10.5px', color: 'var(--color-placeholder)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {tenantName}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={onLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            width: '100%',
            padding: isTablet ? '8px 0' : '8px 10px',
            background: 'none',
            border: '1px solid #E6DFD3',
            borderRadius: '7px',
            fontSize: '12.5px',
            color: 'var(--color-muted)',
            cursor: 'pointer'
          }}
          title="Sign out"
        >
          <LogOut size={14} style={{ flexShrink: 0 }} />
          {!isTablet && <span>Sign out</span>}
        </button>
      </div>
    </aside>
  );
};

