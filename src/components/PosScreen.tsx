import React, { useState } from 'react';
import type { Category, MenuItem, TableItem, CartLine, ModifierOption, VoucherPromo } from '../types/pos';
import { formatIDR } from '../data/initialData';
import { Search, Users, Trash2, Plus, Minus, Tag, ArrowRight, Printer, X, Ticket } from 'lucide-react';
import { useViewport } from '../hooks/useViewport';
import { AlertNotification } from './AlertNotification';

interface PosScreenProps {
  categories: Category[];
  tables: TableItem[];
  cart: CartLine[];
  orderType: 'dinein' | 'takeaway';
  tableNumber: number | null;
  discountType: 'pct' | 'rp';
  discountValue: number;
  shiftOpen: boolean;
  tenantName: string;
  onSetOrderType: (t: 'dinein' | 'takeaway') => void;
  onSelectTable: (num: number) => void;
  onAddToCart: (item: MenuItem, modNames: string[], modKey: string, modTotal: number) => void;
  onUpdateCartQty: (lineId: string, delta: number) => void;
  onClearCart: () => void;
  onSetDiscount: (type: 'pct' | 'rp', val: number) => void;
  onChargeOrder: (paymentMethod: 'cash' | 'qris', cashTendered: number) => void;
  promotions?: VoucherPromo[];
  onValidatePromo?: (code: string, subtotal: number) => Promise<VoucherPromo>;
  taxRate: number;
  taxLabel: string;
}

export const PosScreen: React.FC<PosScreenProps> = ({
  categories,
  tables,
  cart,
  orderType,
  tableNumber,
  discountType,
  discountValue,
  shiftOpen,
  tenantName,
  onSetOrderType,
  onSelectTable,
  onAddToCart,
  onUpdateCartQty,
  onClearCart,
  onSetDiscount,
  onChargeOrder,
  promotions = [],
  onValidatePromo,
  taxRate,
  taxLabel
}) => {
  const { isMobile, isCompactPos } = useViewport();
  const [showMobileCartDrawer, setShowMobileCartDrawer] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showTableModal, setShowTableModal] = useState(false);

  // Modifiers Selection Modal
  const [activeItemForMod, setActiveItemForMod] = useState<MenuItem | null>(null);
  const [selectedMods, setSelectedMods] = useState<Record<string, ModifierOption[]>>({});

  // Discount input inside cart
  const [discountInput, setDiscountInput] = useState<string>(discountValue ? discountValue.toString() : '');

  // Checkout Modal
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'qris'>('cash');
  const [cashInput, setCashInput] = useState<string>('');
  const [checkoutAlert, setCheckoutAlert] = useState<{ title: string; message: string; type?: 'error' | 'warning' } | null>(null);
  const [posAlert, setPosAlert] = useState<{ title: string; message: string; type?: 'error' | 'warning' } | null>(null);

  // Receipt Modal
  const [lastOrderReceipt, setLastOrderReceipt] = useState<any | null>(null);

  // Promo Modal State
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const allActiveItems = categories.flatMap(c => c.items.filter(i => i.active));
  
  const displayedItems = allActiveItems.filter(item => {
    const matchesCat = activeCategoryId === 'all' || item.categoryId === activeCategoryId;
    const matchesSearch = !searchQuery.trim() || item.name.toLowerCase().includes(searchQuery.trim().toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Totals calculations
  const subtotal = cart.reduce((acc, line) => acc + (line.basePrice + line.modTotal) * line.qty, 0);
  let discountAmount = 0;
  if (discountType === 'pct') {
    discountAmount = Math.round((subtotal * discountValue) / 100);
  } else {
    discountAmount = discountValue;
  }
  const afterDiscount = Math.max(0, subtotal - discountAmount);
  const tax = Math.round(afterDiscount * taxRate);
  const total = afterDiscount + tax;

  // Handle clicking item on grid
  const handleItemClick = (item: MenuItem) => {
    if (!shiftOpen) {
      setPosAlert({
        title: 'Shift Closed',
        message: 'Please open a shift in the Shift Reconciliation module before taking new orders or adding items to cart.',
        type: 'warning'
      });
      return;
    }
    setPosAlert(null);
    if (item.modifierGroups && item.modifierGroups.length > 0) {
      setActiveItemForMod(item);
      const initMods: Record<string, ModifierOption[]> = {};
      item.modifierGroups.forEach(g => {
        if (g.required && g.options.length > 0) {
          initMods[g.id] = [g.options[0]];
        } else {
          initMods[g.id] = [];
        }
      });
      setSelectedMods(initMods);
    } else {
      onAddToCart(item, [], '', 0);
    }
  };

  const handleModOptionClick = (groupId: string, option: ModifierOption, multi: boolean) => {
    const current = selectedMods[groupId] || [];
    if (multi) {
      const exists = current.some(o => o.id === option.id);
      if (exists) {
        setSelectedMods({ ...selectedMods, [groupId]: current.filter(o => o.id !== option.id) });
      } else {
        setSelectedMods({ ...selectedMods, [groupId]: [...current, option] });
      }
    } else {
      setSelectedMods({ ...selectedMods, [groupId]: [option] });
    }
  };

  const confirmAddWithMods = () => {
    if (!activeItemForMod) return;
    const allSelectedOptions = Object.values(selectedMods).flat();
    const modNames = allSelectedOptions.map(o => o.name);
    const modKey = allSelectedOptions.map(o => o.id).sort().join('_');
    const modTotal = allSelectedOptions.reduce((acc, o) => acc + o.priceDelta, 0);
    onAddToCart(activeItemForMod, modNames, modKey, modTotal);
    setActiveItemForMod(null);
  };

  const handleApplyDiscount = (type: 'pct' | 'rp') => {
    const val = Number(discountInput) || 0;
    onSetDiscount(type, val);
  };

  const handleApplyVoucher = async (code: string) => {
    if (!onValidatePromo) return;
    setPromoError(null);
    try {
      const voucher = await onValidatePromo(code, subtotal);
      onSetDiscount(voucher.discountType, voucher.discountValue);
      setDiscountInput(voucher.discountValue.toString());
      setShowPromoModal(false);
      setPromoCodeInput('');
    } catch (err: any) {
      setPromoError(err.message || 'Invalid or ineligible voucher code');
    }
  };

  const openCheckout = () => {
    if (cart.length === 0) return;
    setCashInput(total.toString());
    setShowCheckoutModal(true);
  };

  const handleCompletePayment = () => {
    const tendered = paymentMethod === 'cash' ? (Number(cashInput) || total) : total;
    if (paymentMethod === 'cash' && tendered < total) {
      setCheckoutAlert({
        title: 'Insufficient Cash Tendered',
        message: `The cash amount entered (Rp ${tendered.toLocaleString('id-ID')}) is less than the order total (Rp ${total.toLocaleString('id-ID')}). Please enter a valid amount.`,
        type: 'error'
      });
      return;
    }
    setCheckoutAlert(null);
    const receiptData = {
      orderId: 'ORD-' + Math.floor(1000 + Math.random() * 9000),
      time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      orderType,
      tableNumber,
      lines: [...cart],
      totals: { subtotal, discountAmount, tax, total },
      paymentMethod,
      cashTendered: tendered,
      change: tendered - total
    };
    onChargeOrder(paymentMethod, tendered);
    setShowCheckoutModal(false);
    setLastOrderReceipt(receiptData);
  };

  const renderCartContent = (inDrawer = false) => (
    <div style={{ width: inDrawer ? '100%' : '380px', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', height: '100%', flexShrink: 0 }}>
      {/* Cart Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E6DFD3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FBF8F3' }}>
        <div>
          <div style={{ fontSize: '15px', fontWeight: 700 }}>Current Order</div>
          <div style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
            {orderType === 'dinein' ? `Dine-in · ${tableNumber ? `Table ${tableNumber}` : 'No table'}` : 'Takeaway order'}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {cart.length > 0 && (
            <button
              onClick={onClearCart}
              title="Clear cart"
              style={{ border: 'none', background: 'none', color: 'var(--color-danger-text)', cursor: 'pointer', padding: '4px' }}
            >
              <Trash2 size={16} />
            </button>
          )}
          {inDrawer && (
            <button
              onClick={() => setShowMobileCartDrawer(false)}
              style={{ border: 'none', background: 'none', color: 'var(--color-muted)', cursor: 'pointer', padding: '4px' }}
            >
              <X size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Cart Line Items */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
        {cart.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-placeholder)', textAlign: 'center', padding: '20px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#FBF8F3', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <Tag size={20} color="#D8CEBE" />
            </div>
            <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '4px' }}>No items in cart</div>
            <div style={{ fontSize: '12px' }}>Select menu items on the left to start building an order.</div>
          </div>
        ) : (
          cart.map((line) => (
            <div key={line.id} style={{ paddingBottom: '14px', marginBottom: '14px', borderBottom: '1px solid #F1ECE3' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <span style={{ fontSize: '13.5px', fontWeight: 600, flex: 1, paddingRight: '8px' }}>
                  {line.name}
                </span>
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600 }}>
                  {formatIDR((line.basePrice + line.modTotal) * line.qty)}
                </span>
              </div>

              {line.modNames.length > 0 && (
                <div style={{ fontSize: '11.5px', color: 'var(--color-muted)', marginBottom: '8px', lineHeight: 1.4 }}>
                  + {line.modNames.join(', ')}
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: 'var(--color-muted)' }}>
                  @{formatIDR(line.basePrice + line.modTotal)}
                </span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => onUpdateCartQty(line.id, -1)}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: '1px solid #D8CEBE', backgroundColor: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241F18' }}
                  >
                    <Minus size={13} />
                  </button>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, width: '20px', textAlign: 'center' }}>
                    {line.qty}
                  </span>
                  <button
                    onClick={() => onUpdateCartQty(line.id, 1)}
                    style={{ width: '26px', height: '26px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <Plus size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Cart Totals & Discount Drawer */}
      {cart.length > 0 && (
        <div style={{ padding: '16px 20px', backgroundColor: '#FBF8F3', borderTop: '1px solid #E6DFD3' }}>
          {/* Promo Voucher Trigger */}
          <div style={{ marginBottom: '12px' }}>
            <button
              onClick={() => { setPromoError(null); setShowPromoModal(true); }}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '8px',
                border: '1px dashed var(--color-velvet)',
                backgroundColor: '#FFF8F5',
                color: 'var(--color-velvet)',
                fontSize: '12.5px',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={16} /> Apply Promo Voucher
              </span>
              <span style={{ fontSize: '11px', backgroundColor: 'var(--color-velvet)', color: '#fff', padding: '2px 6px', borderRadius: '4px' }}>
                HEMAT20 Available
              </span>
            </button>
          </div>

          <div style={{ display: 'flex', gap: '6px', marginBottom: '14px' }}>
            <input
              type="number"
              value={discountInput}
              onChange={(e) => setDiscountInput(e.target.value)}
              placeholder="Discount"
              style={{ flex: 1, padding: '7px 10px', border: '1px solid #D8CEBE', borderRadius: '6px', fontSize: '12.5px', backgroundColor: '#fff' }}
            />
            <button
              onClick={() => handleApplyDiscount('pct')}
              style={{ padding: '7px 10px', border: '1px solid #D8CEBE', backgroundColor: discountType === 'pct' && discountValue > 0 ? '#241F18' : '#fff', color: discountType === 'pct' && discountValue > 0 ? '#fff' : '#241F18', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              %
            </button>
            <button
              onClick={() => handleApplyDiscount('rp')}
              style={{ padding: '7px 10px', border: '1px solid #D8CEBE', backgroundColor: discountType === 'rp' && discountValue > 0 ? '#241F18' : '#fff', color: discountType === 'rp' && discountValue > 0 ? '#fff' : '#241F18', borderRadius: '6px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
            >
              Rp
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-muted)' }}>
              <span>Subtotal</span>
              <span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(subtotal)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger-text)', fontWeight: 500 }}>
                <span>Discount ({discountType === 'pct' ? `${discountValue}%` : 'Rp'})</span>
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>-{formatIDR(discountAmount)}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--color-muted)' }}>{taxLabel} ({(taxRate * 100).toFixed(0)}%)</span>
              <span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '17px', fontWeight: 700, paddingTop: '8px', borderTop: '1px solid #E6DFD3', marginTop: '4px' }}>
              <span>Total</span>
              <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-velvet)' }}>{formatIDR(total)}</span>
            </div>
          </div>

          <button
            onClick={() => {
              if (inDrawer) setShowMobileCartDrawer(false);
              openCheckout();
            }}
            disabled={!shiftOpen || (orderType === 'dinein' && !tableNumber)}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: !shiftOpen || (orderType === 'dinein' && !tableNumber) ? '#D8CEBE' : 'var(--color-velvet)',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 700,
              cursor: !shiftOpen || (orderType === 'dinein' && !tableNumber) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: !shiftOpen || (orderType === 'dinein' && !tableNumber) ? 'none' : '0 4px 12px rgba(193, 82, 42, 0.3)'
            }}
          >
            <span>Charge {formatIDR(total)}</span>
            <ArrowRight size={18} />
          </button>
          {orderType === 'dinein' && !tableNumber && (
            <div style={{ fontSize: '11px', color: 'var(--color-danger-text)', textAlign: 'center', marginTop: '6px', fontWeight: 500 }}>
              Please select a table before checking out.
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100%', overflow: 'hidden', position: 'relative' }}>
      {/* Left Area: Grid & Category Pills */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', borderRight: isCompactPos ? 'none' : '1px solid #E6DFD3' }}>
        {/* Top Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #E6DFD3', backgroundColor: '#FBF8F3', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: '#fff', border: '1px solid #D8CEBE', borderRadius: '7px', padding: '6px 12px', width: isMobile ? '100%' : '280px' }}>
            <Search size={16} color="var(--color-placeholder)" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search active menu..."
              style={{ border: 'none', background: 'none', width: '100%', fontSize: '13.5px', color: '#241F18' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap', width: isMobile ? '100%' : 'auto', justifyContent: isMobile ? 'space-between' : 'flex-end' }}>
            <div style={{ display: 'flex', backgroundColor: '#E6DFD3', padding: '3px', borderRadius: '7px', gap: '2px' }}>
              <button
                onClick={() => onSetOrderType('dinein')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: orderType === 'dinein' ? '#fff' : 'transparent',
                  color: orderType === 'dinein' ? 'var(--color-velvet)' : 'var(--color-muted)',
                  boxShadow: orderType === 'dinein' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Dine-in
              </button>
              <button
                onClick={() => onSetOrderType('takeaway')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '5px',
                  border: 'none',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  backgroundColor: orderType === 'takeaway' ? '#fff' : 'transparent',
                  color: orderType === 'takeaway' ? 'var(--color-velvet)' : 'var(--color-muted)',
                  boxShadow: orderType === 'takeaway' ? '0 1px 2px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                Takeaway
              </button>
            </div>

            {orderType === 'dinein' && (
              <button
                onClick={() => setShowTableModal(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '7px',
                  border: '1px solid #D8CEBE',
                  backgroundColor: '#fff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  color: '#241F18'
                }}
              >
                <Users size={15} color="var(--color-velvet)" />
                <span>{tableNumber ? `Table ${tableNumber}` : 'Select Table'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Category Pills */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid #E6DFD3', display: 'flex', gap: '8px', overflowX: 'auto', backgroundColor: '#fff', flexShrink: 0 }}>
          <button
            onClick={() => setActiveCategoryId('all')}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeCategoryId === 'all' ? 600 : 500,
              backgroundColor: activeCategoryId === 'all' ? '#241F18' : '#F1ECE3',
              color: activeCategoryId === 'all' ? '#fff' : 'var(--color-muted)',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            All Active ({allActiveItems.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategoryId(cat.id)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                fontSize: '13px',
                fontWeight: activeCategoryId === cat.id ? 600 : 500,
                backgroundColor: activeCategoryId === cat.id ? '#241F18' : '#F1ECE3',
                color: activeCategoryId === cat.id ? '#fff' : 'var(--color-muted)',
                cursor: 'pointer',
                whiteSpace: 'nowrap'
              }}
            >
              {cat.name} ({cat.items.filter(i => i.active).length})
            </button>
          ))}
        </div>

        {posAlert && (
          <div style={{ padding: '16px 20px 0 20px' }}>
            <AlertNotification
              title={posAlert.title}
              message={posAlert.message}
              type={posAlert.type}
              onClose={() => setPosAlert(null)}
            />
          </div>
        )}

        {/* Items Grid */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '14px', alignContent: 'start', paddingBottom: isCompactPos && cart.length > 0 ? '100px' : '20px' }}>
          {displayedItems.map((item) => (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{
                backgroundColor: '#fff',
                border: '1px solid #E6DFD3',
                borderRadius: '10px',
                padding: '14px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                minHeight: '110px',
                position: 'relative',
                boxShadow: '0 1px 3px rgba(36,31,24,0.03)',
                transition: 'transform 0.15s ease, border-color 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--color-velvet)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#E6DFD3'; e.currentTarget.style.transform = 'translateY(0)'; }}
            >
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '6px', lineHeight: 1.3 }}>
                  {item.name}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', fontWeight: 600, color: 'var(--color-velvet)' }}>
                  {formatIDR(item.price)}
                </span>
                {item.modifierGroups && item.modifierGroups.length > 0 && (
                  <span style={{ fontSize: '10px', fontWeight: 700, padding: '2px 5px', borderRadius: '4px', backgroundColor: '#F3E3D8', color: 'var(--color-velvet)', letterSpacing: '0.04em' }}>
                    MOD
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop/Tablet Right Sidebar: Dynamic Cart */}
      {!isCompactPos && renderCartContent(false)}

      {/* Mobile/Compact Tablet Floating Bottom Cart Pill */}
      {isCompactPos && cart.length > 0 && !showMobileCartDrawer && (
        <div style={{
          position: 'fixed',
          bottom: isMobile ? '76px' : '20px',
          left: '16px',
          right: '16px',
          backgroundColor: '#241F18',
          color: '#fff',
          borderRadius: '12px',
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
          zIndex: 80,
          animation: 'voFadeIn 0.15s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ backgroundColor: 'var(--color-velvet)', width: '36px', height: '36px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              {cart.reduce((sum, l) => sum + l.qty, 0)}
            </div>
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700 }}>Current Order</div>
              <div style={{ fontSize: '12px', color: 'var(--color-placeholder)' }}>{formatIDR(subtotal)}</div>
            </div>
          </div>
          <button
            onClick={() => setShowMobileCartDrawer(true)}
            style={{
              backgroundColor: 'var(--color-velvet)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 16px',
              fontSize: '13px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Open Order</span>
            <ArrowRight size={15} />
          </button>
        </div>
      )}

      {/* Mobile/Compact Tablet Cart Slide-up Bottom Sheet Modal */}
      {isCompactPos && showMobileCartDrawer && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(36, 31, 24, 0.55)',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
          zIndex: 90,
          animation: 'voFadeIn 0.15s ease'
        }}>
          <div style={{
            width: '100%',
            maxHeight: '88vh',
            backgroundColor: '#fff',
            borderRadius: '16px 16px 0 0',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.25)',
            animation: 'voSlideUp 0.2s ease'
          }}>
            {renderCartContent(true)}
          </div>
        </div>
      )}

      {/* Table Picker Modal */}
      {showTableModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(36, 31, 24, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, animation: 'voFadeIn 0.15s ease' }}>
          <div className="responsive-modal-box" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '26px', width: 'min(94vw, 520px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <span style={{ fontSize: '16px', fontWeight: 700 }}>Select Table (12 Tables)</span>
              <button onClick={() => setShowTableModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}><X size={18} /></button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '12px', marginBottom: '20px' }}>
              {tables.map((t) => {
                const isSel = tableNumber === t.number;
                return (
                  <button
                    key={t.id}
                    onClick={() => { onSelectTable(t.number); setShowTableModal(false); }}
                    disabled={t.status === 'occupied'}
                    style={{
                      padding: '16px 10px',
                      borderRadius: '8px',
                      border: `2px solid ${isSel ? 'var(--color-velvet)' : t.status === 'occupied' ? '#F6E3DE' : '#E6DFD3'}`,
                      backgroundColor: isSel ? '#F3E3D8' : t.status === 'occupied' ? '#FBF8F3' : '#fff',
                      cursor: t.status === 'occupied' ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      opacity: t.status === 'occupied' ? 0.6 : 1
                    }}
                  >
                    <span style={{ fontSize: '16px', fontWeight: 700, color: isSel ? 'var(--color-velvet)' : '#241F18' }}>T-{t.number}</span>
                    <span style={{ fontSize: '11px', color: t.status === 'occupied' ? 'var(--color-danger-text)' : 'var(--color-success-text)', fontWeight: 600, textTransform: 'capitalize' }}>
                      {t.status} ({t.seats}s)
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modifier Modal */}
      {activeItemForMod && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(36, 31, 24, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, animation: 'voFadeIn 0.15s ease' }}>
          <div className="responsive-modal-box" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '26px', width: 'min(94vw, 440px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '4px' }}>{activeItemForMod.name}</div>
            <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--color-velvet)', marginBottom: '18px' }}>{formatIDR(activeItemForMod.price)}</div>

            {activeItemForMod.modifierGroups.map((g) => (
              <div key={g.id} style={{ marginBottom: '18px' }}>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>
                  {g.name} <span style={{ fontSize: '11px', color: 'var(--color-placeholder)', fontWeight: 400 }}>({g.multi ? 'Select any' : 'Select one'})</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {g.options.map((opt) => {
                    const isSelected = (selectedMods[g.id] || []).some(o => o.id === opt.id);
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleModOptionClick(g.id, opt, g.multi)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 12px',
                          borderRadius: '7px',
                          border: `1px solid ${isSelected ? 'var(--color-velvet)' : '#D8CEBE'}`,
                          backgroundColor: isSelected ? '#F3E3D8' : '#fff',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <span style={{ fontSize: '13px', fontWeight: isSelected ? 600 : 500 }}>{opt.name}</span>
                        {opt.priceDelta > 0 && (
                          <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: 'var(--color-velvet)' }}>+{formatIDR(opt.priceDelta)}</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setActiveItemForMod(null)} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #D8CEBE', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmAddWithMods} style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>Add to cart</button>
            </div>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(36, 31, 24, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 60, animation: 'voFadeIn 0.15s ease' }}>
          <div className="responsive-modal-box" style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '26px', width: 'min(94vw, 420px)', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>Checkout Order</div>
            <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '28px', fontWeight: 700, color: 'var(--color-velvet)', marginBottom: '20px' }}>{formatIDR(total)}</div>

            {checkoutAlert && (
              <AlertNotification
                title={checkoutAlert.title}
                message={checkoutAlert.message}
                type={checkoutAlert.type}
                onClose={() => setCheckoutAlert(null)}
              />
            )}

            <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
              <button
                onClick={() => setPaymentMethod('cash')}
                style={{ flex: 1, padding: '10px', borderRadius: '7px', border: `2px solid ${paymentMethod === 'cash' ? 'var(--color-velvet)' : '#E6DFD3'}`, backgroundColor: paymentMethod === 'cash' ? '#F3E3D8' : '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                Cash
              </button>
              <button
                onClick={() => setPaymentMethod('qris')}
                style={{ flex: 1, padding: '10px', borderRadius: '7px', border: `2px solid ${paymentMethod === 'qris' ? 'var(--color-velvet)' : '#E6DFD3'}`, backgroundColor: paymentMethod === 'qris' ? '#F3E3D8' : '#fff', fontWeight: 600, cursor: 'pointer' }}
              >
                QRIS
              </button>
            </div>

            {paymentMethod === 'cash' ? (
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>Cash Tendered (Rp)</label>
                <input
                  type="number"
                  value={cashInput}
                  onChange={(e) => setCashInput(e.target.value)}
                  style={{ width: '100%', padding: '11px 12px', border: '1px solid #D8CEBE', borderRadius: '7px', fontSize: '15px', fontFamily: 'var(--font-mono)', marginBottom: '10px' }}
                />
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => setCashInput(total.toString())} style={{ flex: 1, padding: '7px', border: '1px solid #D8CEBE', borderRadius: '5px', fontSize: '11px', fontWeight: 600, backgroundColor: '#fff', cursor: 'pointer' }}>Exact</button>
                  <button onClick={() => setCashInput((Math.ceil(total / 50000) * 50000).toString())} style={{ flex: 1, padding: '7px', border: '1px solid #D8CEBE', borderRadius: '5px', fontSize: '11px', fontWeight: 600, backgroundColor: '#fff', cursor: 'pointer' }}>+50rb</button>
                  <button onClick={() => setCashInput((Math.ceil(total / 100000) * 100000).toString())} style={{ flex: 1, padding: '7px', border: '1px solid #D8CEBE', borderRadius: '5px', fontSize: '11px', fontWeight: 600, backgroundColor: '#fff', cursor: 'pointer' }}>+100rb</button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '24px', backgroundColor: '#FBF8F3', borderRadius: '8px', marginBottom: '24px' }}>
                <div style={{ width: '140px', height: '140px', margin: '0 auto 12px', backgroundColor: '#241F18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', borderRadius: '10px', fontSize: '18px', fontWeight: 700, letterSpacing: '0.1em' }}>
                  QRIS CODE
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>Scan with GoPay, OVO, Dana, or BCA Mobile</div>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowCheckoutModal(false)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid #D8CEBE', backgroundColor: '#fff', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
              <button onClick={handleCompletePayment} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}>Complete Payment</button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {lastOrderReceipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(36, 31, 24, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 70, animation: 'voFadeIn 0.15s ease' }}>
          <div className="receipt-clip responsive-modal-box" style={{ backgroundColor: '#fff', width: 'min(94vw, 340px)', padding: '26px 22px 36px', boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)', position: 'relative' }}>
            <div style={{ textAlign: 'center', borderBottom: '1px dashed #D8CEBE', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '16px', fontWeight: 700 }}>{tenantName}</div>
              <div style={{ fontSize: '11px', color: 'var(--color-muted)', marginTop: '2px' }}>{lastOrderReceipt.orderId} · {lastOrderReceipt.time}</div>
              <div style={{ fontSize: '11.5px', fontWeight: 600, textTransform: 'uppercase', marginTop: '6px' }}>
                {lastOrderReceipt.orderType} {lastOrderReceipt.tableNumber ? `(Table ${lastOrderReceipt.tableNumber})` : ''}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderBottom: '1px dashed #D8CEBE', paddingBottom: '16px', marginBottom: '16px' }}>
              {lastOrderReceipt.lines.map((l: any, i: number) => (
                <div key={i} style={{ fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>{l.qty}x {l.name}</span>
                    <span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR((l.basePrice + l.modTotal) * l.qty)}</span>
                  </div>
                  {l.modNames.length > 0 && (
                    <div style={{ fontSize: '10.5px', color: 'var(--color-muted)', paddingLeft: '14px' }}>+{l.modNames.join(', ')}</div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', borderBottom: '1px dashed #D8CEBE', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>Subtotal</span><span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(lastOrderReceipt.totals.subtotal)}</span></div>
              {lastOrderReceipt.totals.discountAmount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-danger-text)' }}><span>Discount</span><span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>-{formatIDR(lastOrderReceipt.totals.discountAmount)}</span></div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{taxLabel} ({(taxRate * 100).toFixed(0)}%)</span><span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(lastOrderReceipt.totals.tax)}</span></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', fontWeight: 700, marginTop: '4px' }}><span>Total</span><span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(lastOrderReceipt.totals.total)}</span></div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', textTransform: 'capitalize' }}><span>Payment ({lastOrderReceipt.paymentMethod})</span><span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(lastOrderReceipt.cashTendered)}</span></div>
              {lastOrderReceipt.paymentMethod === 'cash' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600 }}><span>Change</span><span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>{formatIDR(lastOrderReceipt.change)}</span></div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => window.print()} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #D8CEBE', backgroundColor: '#fff', fontSize: '12px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Printer size={14} /> Print
              </button>
              <button onClick={() => setLastOrderReceipt(null)} style={{ flex: 1, padding: '10px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Promo & Voucher Modal */}
      {showPromoModal && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="responsive-modal-box" style={{ width: 'min(94vw, 420px)', backgroundColor: '#fff', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3)', border: '1px solid #E6DFD3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#241F18', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={20} color="var(--color-velvet)" /> Select or Enter Voucher
              </h3>
              <button onClick={() => setShowPromoModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                value={promoCodeInput}
                onChange={e => setPromoCodeInput(e.target.value.toUpperCase())}
                placeholder="Enter Promo Code (e.g. HEMAT20)"
                style={{ flex: 1, padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '8px', fontSize: '14px', textTransform: 'uppercase', fontWeight: 600 }}
              />
              <button
                onClick={() => handleApplyVoucher(promoCodeInput)}
                disabled={!promoCodeInput.trim()}
                style={{ padding: '10px 16px', backgroundColor: promoCodeInput.trim() ? '#241F18' : '#D8CEBE', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: promoCodeInput.trim() ? 'pointer' : 'not-allowed' }}
              >
                Apply
              </button>
            </div>

            {promoError && (
              <div style={{ padding: '10px', borderRadius: '8px', backgroundColor: '#FEE2E2', color: '#991B1B', fontSize: '12.5px', fontWeight: 600, marginBottom: '16px' }}>
                ⚠️ {promoError}
              </div>
            )}

            <div style={{ fontSize: '12.5px', fontWeight: 700, color: 'var(--color-muted)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Available Vouchers
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto' }}>
              {promotions.filter(p => p.active).map((promo) => {
                const isEligible = subtotal >= promo.minSpend;
                return (
                  <div
                    key={promo.code}
                    data-testid={`voucher-card-${promo.code}`}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      border: isEligible ? '1px solid var(--color-velvet)' : '1px solid #E6DFD3',
                      backgroundColor: isEligible ? '#FFF8F5' : '#FBF8F3',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      opacity: isEligible ? 1 : 0.65
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 800, fontSize: '14px', color: '#241F18', backgroundColor: '#E6DFD3', padding: '2px 8px', borderRadius: '4px' }}>
                          {promo.code}
                        </span>
                        {!isEligible && (
                          <span style={{ fontSize: '11px', color: 'var(--color-danger-text)', fontWeight: 600 }}>
                            Min. {formatIDR(promo.minSpend)}
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '6px', fontWeight: 500 }}>
                        {promo.label}
                      </div>
                    </div>

                    <button
                      onClick={() => handleApplyVoucher(promo.code)}
                      disabled={!isEligible}
                      style={{
                        padding: '8px 14px',
                        borderRadius: '6px',
                        border: 'none',
                        backgroundColor: isEligible ? 'var(--color-velvet)' : '#D8CEBE',
                        color: '#fff',
                        fontSize: '12.5px',
                        fontWeight: 700,
                        cursor: isEligible ? 'pointer' : 'not-allowed'
                      }}
                    >
                      Use
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
