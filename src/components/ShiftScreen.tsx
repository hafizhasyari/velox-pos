import React, { useState } from 'react';
import type { ShiftRecord } from '../types/pos';
import { formatIDR } from '../data/initialData';
import { Clock, CheckCircle2, AlertCircle } from 'lucide-react';
import { AlertNotification } from './AlertNotification';

interface ShiftScreenProps {
  shiftOpen: boolean;
  shiftOpeningCash: number;
  shiftExpectedCash: number;
  shiftHistory: ShiftRecord[];
  onOpenShift: (opening: number) => void;
  onCloseShift: (counted: number, variance: number) => void;
}

export const ShiftScreen: React.FC<ShiftScreenProps> = ({
  shiftOpen,
  shiftOpeningCash,
  shiftExpectedCash,
  shiftHistory,
  onOpenShift,
  onCloseShift
}) => {
  const [openingInput, setOpeningInput] = useState('200000');
  const [closingInput, setClosingInput] = useState('');
  const [shiftAlert, setShiftAlert] = useState<{ title: string; message: string; type?: 'error' | 'warning' } | null>(null);

  const countedVal = Number(closingInput) || 0;
  const varianceVal = shiftOpen ? (countedVal - shiftExpectedCash) : 0;

  const handleOpenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(openingInput) || 0;
    onOpenShift(val);
  };

  const handleCloseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (closingInput === '') {
      setShiftAlert({
        title: 'Counted Cash Required',
        message: 'Please enter the physical cash amount counted in your drawer before closing the shift.',
        type: 'error'
      });
      return;
    }
    setShiftAlert(null);
    onCloseShift(countedVal, varianceVal);
    setClosingInput('');
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1180px', width: '100%' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Shift Reconciliation</h1>
        <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Manage cashier drawer cash, open/close shift, and reconcile variances</div>
      </div>

      <div className="responsive-grid-2" style={{ gap: '20px', alignItems: 'start' }}>
        {/* Left Card: Active Drawer State */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <span style={{ fontSize: '15px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={18} color="var(--color-velvet)" />
              Current Drawer Status
            </span>
            <span style={{
              fontSize: '11.5px',
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: '5px',
              backgroundColor: shiftOpen ? '#E7EFE4' : '#F1ECE3',
              color: shiftOpen ? 'var(--color-success-text)' : 'var(--color-muted)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {shiftOpen ? <CheckCircle2 size={13} /> : null}
              {shiftOpen ? 'OPEN' : 'CLOSED'}
            </span>
          </div>

          {!shiftOpen ? (
            <form onSubmit={handleOpenSubmit}>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', lineHeight: 1.5, marginBottom: '20px' }}>
                Open a new cashier shift by entering the starting petty cash in the drawer. Orders can only be processed when a shift is active.
              </p>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                Opening Cash Drawer Amount (Rp)
              </label>
              <input
                type="number"
                value={openingInput}
                onChange={(e) => setOpeningInput(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '7px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '20px'
                }}
                required
              />
              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'var(--color-velvet)',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 2px 6px rgba(193, 82, 42, 0.25)'
                }}
              >
                Open Shift &amp; Start Counter
              </button>
            </form>
          ) : (
            <form onSubmit={handleCloseSubmit}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#FBF8F3', border: '1px solid #E6DFD3', borderRadius: '8px', padding: '16px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Opening Cash</span>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatIDR(shiftOpeningCash)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                  <span style={{ color: 'var(--color-muted)' }}>Cash Sales Taken</span>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--color-success-text)' }}>+{formatIDR(shiftExpectedCash - shiftOpeningCash)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14.5px', fontWeight: 700, borderTop: '1px solid #E6DFD3', paddingTop: '10px' }}>
                  <span>Expected Cash Drawer</span>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-velvet)' }}>{formatIDR(shiftExpectedCash)}</span>
                </div>
              </div>

              {shiftAlert && (
                <AlertNotification
                  title={shiftAlert.title}
                  message={shiftAlert.message}
                  type={shiftAlert.type}
                  onClose={() => setShiftAlert(null)}
                />
              )}

              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                Actual Counted Cash in Drawer (Rp)
              </label>
              <input
                type="number"
                value={closingInput}
                onChange={(e) => setClosingInput(e.target.value)}
                placeholder={shiftExpectedCash.toString()}
                style={{
                  width: '100%',
                  padding: '11px 12px',
                  border: '1px solid #D8CEBE',
                  borderRadius: '7px',
                  fontSize: '15px',
                  fontFamily: 'var(--font-mono)',
                  marginBottom: '14px'
                }}
              />

              {closingInput !== '' && (
                <div style={{
                  padding: '12px 14px',
                  borderRadius: '7px',
                  backgroundColor: varianceVal === 0 ? '#E7EFE4' : '#F6E3DE',
                  color: varianceVal === 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '20px',
                  fontSize: '13px',
                  fontWeight: 600
                }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {varianceVal === 0 ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    Variance Check
                  </span>
                  <span className="tnum" style={{ fontFamily: 'var(--font-mono)' }}>
                    {varianceVal === 0 ? 'Exact (Rp0)' : `${varianceVal > 0 ? '+' : ''}${formatIDR(varianceVal)}`}
                  </span>
                </div>
              )}

              <button
                type="submit"
                style={{
                  width: '100%',
                  padding: '13px',
                  borderRadius: '8px',
                  border: '1px solid #D8CEBE',
                  backgroundColor: '#241F18',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Close Shift &amp; Reconcile
              </button>
            </form>
          )}
        </div>

        {/* Right Card: Shift History */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>Past Shift Reconciliations</div>

          <div style={{ border: '1px solid #E6DFD3', borderRadius: '8px', overflow: 'hidden' }}>
            <div style={{ display: 'flex', backgroundColor: '#FBF8F3', padding: '10px 14px', fontSize: '11px', fontWeight: 600, color: 'var(--color-placeholder)', textTransform: 'uppercase', letterSpacing: '0.03em', borderBottom: '1px solid #E6DFD3' }}>
              <span style={{ flex: 1.2 }}>Shift Date</span>
              <span style={{ flex: 1 }}>Opening</span>
              <span style={{ flex: 1 }}>Expected</span>
              <span style={{ flex: 1 }}>Counted</span>
              <span style={{ width: '90px', textAlign: 'right' }}>Variance</span>
            </div>

            {shiftHistory.map((h) => (
              <div key={h.id} style={{ display: 'flex', padding: '12px 14px', fontSize: '13px', borderBottom: '1px solid #F1ECE3', alignItems: 'center' }}>
                <span style={{ flex: 1.2, fontWeight: 500 }}>{h.date}</span>
                <span className="tnum" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}>{formatIDR(h.opening)}</span>
                <span className="tnum" style={{ flex: 1, fontFamily: 'var(--font-mono)' }}>{formatIDR(h.expected)}</span>
                <span className="tnum" style={{ flex: 1, fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatIDR(h.counted)}</span>
                <span style={{ width: '90px', textAlign: 'right' }}>
                  <span className="tnum" style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '11.5px',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '4px',
                    backgroundColor: h.variance === 0 ? '#E7EFE4' : '#F6E3DE',
                    color: h.variance === 0 ? 'var(--color-success-text)' : 'var(--color-danger-text)'
                  }}>
                    {h.variance === 0 ? 'Rp0' : `${h.variance > 0 ? '+' : ''}${formatIDR(h.variance)}`}
                  </span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
