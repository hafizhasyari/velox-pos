import React, { useState, useEffect } from 'react';
import { BrowserRouter, useNavigate, useLocation } from 'react-router-dom';
import type { ScreenType, RoleType, MenuItem, CartLine, UserAccount } from './types/pos';
import { usePosServices } from './hooks/usePosServices';
import { Sidebar } from './components/Sidebar';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { MenuScreen } from './components/MenuScreen';
import { PosScreen } from './components/PosScreen';
import { ShiftScreen } from './components/ShiftScreen';
import { KdsScreen } from './components/KdsScreen';
import { PromotionScreen } from './components/PromotionScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { Activity, AlertTriangle, Database, Server } from 'lucide-react';
import { useViewport } from './hooks/useViewport';
import { canAccessScreen, getAllowedScreens } from './utils/permissionHelper';
import './index.css';

const AppContent: React.FC = () => {
  const { isMobile, isTablet, isDesktop } = useViewport();
  const location = useLocation();
  const navigate = useNavigate();

  const rawPath = location.pathname.replace(/^\//, '').toLowerCase();
  const validScreens: ScreenType[] = ['login', 'signup', 'dashboard', 'menu', 'promotions', 'pos', 'shift', 'kds', 'settings'];
  const screen: ScreenType = validScreens.includes(rawPath as ScreenType)
    ? (rawPath as ScreenType)
    : (localStorage.getItem('velox_auth_token') ? 'pos' : 'login');

  const [tableNumber, setTableNumber] = useState<number | null>(null);
  const [cart, setCart] = useState<CartLine[]>([]);
  const [orderType, setOrderType] = useState<'dinein' | 'takeaway'>('dinein');
  const [discountType, setDiscountType] = useState<'pct' | 'rp'>('pct');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const {
    loading,
    error,
    role,
    tenantName,
    tenantConfig,
    users,
    roles,
    permissions,
    categories,
    tables,
    shiftOpen,
    shiftOpeningCash,
    shiftExpectedCash,
    shiftHistory,
    kitchenTickets,
    promotions,
    devModeOpen,
    isSimulatedError,
    setDevModeOpen,
    login,
    signup,
    logout,
    saveCategory,
    saveItem,
    toggleArchiveItem,
    chargeOrder,
    openShift,
    closeShift,
    updateKitchenStatus,
    validateAndApplyPromo,
    savePromo,
    togglePromo,
    deletePromo,
    updateTaxConfig,
    addStaff,
    deleteStaff,
    createRole,
    updateRole,
    deleteRole,
    toggleNetworkErrorSimulation,
    resetMockDatabase,
    refreshAllData
  } = usePosServices();

  // Get current user object
  const currentUser: UserAccount | undefined = users.find(u => u.roleId === role);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3200);
  };

  // Sync canonical URL path if root or invalid
  useEffect(() => {
    const canonicalPath = `/${screen}`;
    if (location.pathname !== canonicalPath) {
      navigate(canonicalPath, { replace: true });
    }
  }, [location.pathname, screen, navigate]);

  // RBAC Route Guard (Dynamic permission check)
  useEffect(() => {
    if (!currentUser || !roles.length || screen === 'login' || screen === 'signup') return;
    
    const hasAccess = canAccessScreen(currentUser.roleId, screen, roles);
    
    if (!hasAccess) {
      const allowedScreens = getAllowedScreens(currentUser.roleId, roles);
      const firstAllowed = allowedScreens[0] || 'pos';
      
      navigate(`/${firstAllowed}`, { replace: true });
      showToast('Anda tidak memiliki akses ke halaman ini');
    }
  }, [currentUser, roles, screen, navigate]);

  const handleLogin = async (selectedRole: RoleType) => {
    try {
      await login(selectedRole);
      const allowedScreens = getAllowedScreens(selectedRole, roles);
      const firstAllowed = allowedScreens.includes('dashboard') ? 'dashboard' : (allowedScreens[0] || 'pos');
      navigate(`/${firstAllowed}`);
      showToast(`Logged into Auth Microservice as ${selectedRole.toUpperCase()}`);
    } catch (err: any) {
      showToast(`Login error: ${err.message}`);
    }
  };

  const handleSignup = async (businessName: string) => {
    try {
      await signup(businessName, 'Owner', 'owner@warung.id');
      navigate('/dashboard');
      showToast(`Tenant registered in Identity Microservice: ${businessName}`);
    } catch (err: any) {
      showToast(`Signup error: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    showToast('Session terminated in Auth Service');
  };

  const handleSaveCategory = async (name: string) => {
    try {
      await saveCategory(name);
      showToast(`Category "${name}" synced with Catalog Service`);
    } catch (err: any) {
      showToast(`Catalog Service error: ${err.message}`);
    }
  };

  const handleSaveItem = async (item: MenuItem) => {
    try {
      await saveItem(item);
      showToast(`Item "${item.name}" synced with Catalog Service`);
    } catch (err: any) {
      showToast(`Catalog Service error: ${err.message}`);
    }
  };

  const handleToggleArchive = async (item: MenuItem) => {
    try {
      await toggleArchiveItem(item.id);
      showToast(`${!item.active ? 'Restored' : 'Archived'} in Catalog Service`);
    } catch (err: any) {
      showToast(`Catalog Service error: ${err.message}`);
    }
  };

  const handleSelectTable = (num: number) => {
    setTableNumber(num);
    showToast(`Locked Table ${num} via Order Service`);
  };

  const handleAddToCart = (item: MenuItem, modNames: string[], modKey: string, modTotal: number) => {
    const lineId = `${item.id}_${modKey}`;
    const existingIndex = cart.findIndex((l) => `${l.itemId}_${l.modKey}` === lineId);

    if (existingIndex > -1) {
      const updated = [...cart];
      updated[existingIndex].qty += 1;
      setCart(updated);
    } else {
      const newLine: CartLine = {
        id: lineId,
        itemId: item.id,
        name: item.name,
        basePrice: item.price,
        modNames,
        modKey,
        modTotal,
        qty: 1
      };
      setCart([...cart, newLine]);
    }
  };

  const handleUpdateCartQty = (lineId: string, delta: number) => {
    const updated = cart
      .map((l) => (l.id === lineId ? { ...l, qty: l.qty + delta } : l))
      .filter((l) => l.qty > 0);
    setCart(updated);
  };

  const handleClearCart = () => {
    setCart([]);
    setDiscountValue(0);
    showToast('Cart cleared');
  };

  const handleChargeOrder = async (paymentMethod: 'cash' | 'qris', cashTendered: number) => {
    try {
      await chargeOrder(
        cart,
        orderType,
        tableNumber,
        discountValue,
        discountType,
        paymentMethod,
        cashTendered
      );

      setCart([]);
      setDiscountValue(0);
      if (orderType === 'dinein') setTableNumber(null);

      showToast(`Payment verified via Payment & Shift Microservices!`);
    } catch (err: any) {
      showToast(`Payment Service error: ${err.message}`);
    }
  };

  const handleOpenShift = async (opening: number) => {
    try {
      await openShift(opening);
      showToast(`Shift opened in Cashier Microservice (Rp${opening.toLocaleString()})`);
    } catch (err: any) {
      showToast(`Shift Service error: ${err.message}`);
    }
  };

  const handleCloseShift = async (counted: number, variance: number) => {
    try {
      await closeShift(counted, variance);
      showToast(`Reconciled with Shift Service! Variance: Rp${variance.toLocaleString()}`);
    } catch (err: any) {
      showToast(`Shift Service error: ${err.message}`);
    }
  };

  if (screen === 'login') {
    return <LoginScreen onLogin={handleLogin} onGoToSignup={() => navigate('/signup')} roles={roles} />;
  }

  if (screen === 'signup') {
    return <SignupScreen onSignup={handleSignup} onGoToLogin={() => navigate('/login')} />;
  }

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: '100vh', width: '100vw', overflow: 'hidden' }}>
      <Sidebar
        screen={screen}
        role={role}
        currentUser={currentUser}
        roles={roles}
        tenantName={tenantName}
        onNavigate={(s) => navigate('/' + s)}
        onLogout={handleLogout}
      />

      <main style={{
        flex: 1,
        height: '100vh',
        paddingTop: isMobile ? '56px' : '0',
        paddingBottom: isMobile ? '64px' : '0',
        overflowY: 'auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
        {loading && (
          <div style={{ padding: '48px', color: 'var(--color-muted)', fontSize: '15px', fontWeight: 600 }}>
            Syncing with Velox Microservices Gateway...
          </div>
        )}

        {!loading && error && (
          <div style={{ padding: '48px', maxWidth: '600px', width: '100%' }}>
            <div style={{ backgroundColor: '#F6E3DE', border: '1px solid var(--color-danger-text)', padding: '20px', borderRadius: '10px', color: 'var(--color-danger-text)' }}>
              <h3 style={{ margin: '0 0 8px', fontSize: '16px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AlertTriangle size={20} />
                Microservices Gateway Error
              </h3>
              <p style={{ margin: '0 0 16px', fontSize: '13.5px' }}>{error}</p>
              <button
                onClick={refreshAllData}
                style={{
                  padding: '9px 16px',
                  backgroundColor: 'var(--color-danger-text)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Retry Gateway Sync
              </button>
            </div>
          </div>
        )}

        {!loading && !error && screen === 'dashboard' && <DashboardScreen tenantName={tenantName} />}
        {!loading && !error && screen === 'menu' && (
          <MenuScreen
            categories={categories}
            onSaveCategory={handleSaveCategory}
            onSaveItem={handleSaveItem}
            onToggleArchive={handleToggleArchive}
          />
        )}
        {!loading && !error && screen === 'pos' && (
          <PosScreen
            categories={categories}
            tables={tables}
            cart={cart}
            orderType={orderType}
            tableNumber={tableNumber}
            discountType={discountType}
            discountValue={discountValue}
            shiftOpen={shiftOpen}
            tenantName={tenantName}
            promotions={promotions}
            onValidatePromo={validateAndApplyPromo}
            taxRate={tenantConfig.taxRate}
            taxLabel={tenantConfig.taxLabel}
            onSetOrderType={setOrderType}
            onSelectTable={handleSelectTable}
            onAddToCart={handleAddToCart}
            onUpdateCartQty={handleUpdateCartQty}
            onClearCart={handleClearCart}
            onSetDiscount={(t, v) => {
              setDiscountType(t);
              setDiscountValue(v);
              showToast(`Discount applied: ${t === 'pct' ? `${v}%` : `Rp${v.toLocaleString()}`}`);
            }}
            onChargeOrder={handleChargeOrder}
          />
        )}
        {!loading && !error && screen === 'kds' && (
          <KdsScreen
            tickets={kitchenTickets}
            onUpdateStatus={updateKitchenStatus}
          />
        )}
        {!loading && !error && screen === 'settings' && (
          <SettingsScreen 
            tenantConfig={tenantConfig} 
            users={users}
            roles={roles}
            permissions={permissions}
            onUpdate={updateTaxConfig} 
            onAddStaff={addStaff}
            onDeleteStaff={deleteStaff}
            onCreateRole={createRole}
            onUpdateRole={updateRole}
            onDeleteRole={deleteRole}
          />
        )}
        {!loading && !error && screen === 'shift' && (
          <ShiftScreen
            shiftOpen={shiftOpen}
            shiftOpeningCash={shiftOpeningCash}
            shiftExpectedCash={shiftExpectedCash}
            shiftHistory={shiftHistory}
            onOpenShift={handleOpenShift}
            onCloseShift={handleCloseShift}
          />
        )}
        {!loading && !error && screen === 'promotions' && (
          <PromotionScreen
            promotions={promotions}
            onSavePromo={savePromo}
            onTogglePromo={togglePromo}
            onDeletePromo={deletePromo}
          />
        )}
      </main>

      {/* Floating Microservices E2E Inspector Badge */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? '136px' : '20px',
        left: isDesktop ? '240px' : (isTablet ? '84px' : '16px'),
        zIndex: 90,
        transition: 'left 0.2s ease, bottom 0.2s ease'
      }}>
        <button
          onClick={() => setDevModeOpen(!devModeOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '9px 15px',
            borderRadius: '30px',
            backgroundColor: isSimulatedError ? 'var(--color-danger-text)' : '#241F18',
            color: '#fff',
            border: '1px solid rgba(255,255,255,0.15)',
            fontSize: '12px',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(36,31,24,0.3)',
            cursor: 'pointer'
          }}
        >
          <Activity size={15} color={isSimulatedError ? '#FFB8B8' : '#47bfff'} />
          <span>E2E Microservice Adapter: {isSimulatedError ? 'ERROR SIMULATED' : 'ONLINE (MOCK)'}</span>
        </button>

        {devModeOpen && (
          <div style={{
            position: 'absolute',
            bottom: '46px',
            left: 0,
            width: '320px',
            backgroundColor: '#241F18',
            color: '#F6F2EC',
            border: '1px solid #4D4539',
            borderRadius: '12px',
            padding: '18px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', borderBottom: '1px solid #3A332A', paddingBottom: '10px' }}>
              <span style={{ fontSize: '13.5px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Server size={16} color="var(--color-velvet)" />
                Phase 1 Service Gateway
              </span>
              <span style={{ fontSize: '10px', backgroundColor: '#3A332A', padding: '3px 7px', borderRadius: '4px', color: 'var(--color-success-text)' }}>
                8 Active Adapters
              </span>
            </div>

            <div style={{ fontSize: '12px', color: 'var(--color-placeholder)', marginBottom: '16px', lineHeight: 1.5 }}>
              All UI actions are routed through modular async Service Adapters (`/api/v1/*`) backed by LocalStorage (`velox_db_v1`) to test end-to-end microservice readiness.
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <button
                onClick={toggleNetworkErrorSimulation}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '6px',
                  border: '1px solid #4D4539',
                  backgroundColor: isSimulatedError ? 'var(--color-danger-text)' : '#3A332A',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <AlertTriangle size={14} />
                {isSimulatedError ? 'Disable Simulated Gateway Error' : 'Simulate 500 Gateway Error'}
              </button>

              <button
                onClick={resetMockDatabase}
                style={{
                  width: '100%',
                  padding: '9px',
                  borderRadius: '6px',
                  border: '1px solid #4D4539',
                  backgroundColor: '#2E2820',
                  color: '#F6F2EC',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Database size={14} />
                Reset E2E Database State
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Floating Glassmorphic Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#241F18',
          color: '#fff',
          padding: '11px 20px',
          borderRadius: '30px',
          fontSize: '13.5px',
          fontWeight: 600,
          boxShadow: '0 8px 24px rgba(36, 31, 24, 0.25)',
          zIndex: 100,
          pointerEvents: 'none',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'voToast 3.2s ease forwards'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--color-velvet)' }} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;
