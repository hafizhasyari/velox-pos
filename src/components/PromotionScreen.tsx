import React, { useState } from 'react';
import type { VoucherPromo } from '../types/pos';
import { Ticket, Plus, Search, Trash2, Edit, CheckCircle2, XCircle, Percent, X, Tag } from 'lucide-react';

interface PromotionScreenProps {
  promotions: VoucherPromo[];
  onSavePromo: (promo: VoucherPromo) => Promise<void>;
  onTogglePromo: (code: string) => Promise<void>;
  onDeletePromo: (code: string) => Promise<void>;
}

export const PromotionScreen: React.FC<PromotionScreenProps> = ({
  promotions,
  onSavePromo,
  onTogglePromo,
  onDeletePromo
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<VoucherPromo | null>(null);

  // Form states
  const [formCode, setFormCode] = useState('');
  const [formLabel, setFormLabel] = useState('');
  const [formType, setFormType] = useState<'pct' | 'rp'>('pct');
  const [formValue, setFormValue] = useState<string>('20');
  const [formMinSpend, setFormMinSpend] = useState<string>('50000');
  const [formActive, setFormActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const handleOpenCreateModal = () => {
    setEditingPromo(null);
    setFormCode('');
    setFormLabel('');
    setFormType('pct');
    setFormValue('20');
    setFormMinSpend('50000');
    setFormActive(true);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (promo: VoucherPromo) => {
    setEditingPromo(promo);
    setFormCode(promo.code);
    setFormLabel(promo.label);
    setFormType(promo.discountType);
    setFormValue(promo.discountValue.toString());
    setFormMinSpend(promo.minSpend.toString());
    setFormActive(promo.active);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    const cleanCode = formCode.trim().toUpperCase().replace(/[^A-Z0-9_]/g, '');
    if (!cleanCode) {
      setFormError('Promo Code is required and must be alphanumeric.');
      return;
    }
    if (!formLabel.trim()) {
      setFormError('Description label is required.');
      return;
    }

    const val = Number(formValue);
    const min = Number(formMinSpend);

    if (isNaN(val) || val <= 0) {
      setFormError('Discount value must be a positive number.');
      return;
    }
    if (formType === 'pct' && val > 100) {
      setFormError('Percentage discount cannot exceed 100%.');
      return;
    }
    if (isNaN(min) || min < 0) {
      setFormError('Minimum spend must be 0 or more.');
      return;
    }

    try {
      setIsSaving(true);
      await onSavePromo({
        code: cleanCode,
        label: formLabel.trim(),
        discountType: formType,
        discountValue: val,
        minSpend: min,
        active: formActive
      });
      setIsModalOpen(false);
    } catch (err: any) {
      setFormError(err.message || 'Failed to save voucher');
    } finally {
      setIsSaving(false);
    }
  };

  // Filter & search
  const filteredPromos = promotions.filter(p => {
    const matchesSearch = p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.label.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterStatus === 'active') return p.active;
    if (filterStatus === 'inactive') return !p.active;
    return true;
  });

  const totalCount = promotions.length;
  const activeCount = promotions.filter(p => p.active).length;
  const maxDiscount = promotions.reduce((max, p) => {
    if (p.discountType === 'pct') return Math.max(max, p.discountValue);
    return max;
  }, 0);

  const formatIDR = (n: number) => `Rp${n.toLocaleString('id-ID')}`;

  return (
    <div style={{ flex: 1, backgroundColor: '#F6F2EC', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      {/* Top Header */}
      <div style={{ padding: '24px 32px 20px', borderBottom: '1px solid #E6DFD3', backgroundColor: '#FBF8F3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#F3E3D8', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-velvet)' }}>
              <Ticket size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: 800, color: '#241F18', margin: 0 }}>Voucher & Promo Management</h1>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', margin: 0 }}>Create promotional campaigns and set minimum spend thresholds</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleOpenCreateModal}
          style={{
            padding: '10px 18px',
            backgroundColor: 'var(--color-velvet)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 700,
            fontSize: '13.5px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            boxShadow: '0 2px 6px rgba(193,82,42,0.25)',
            transition: 'background-color 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#A64320'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--color-velvet)'}
        >
          <Plus size={16} />
          Create New Voucher
        </button>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 32px' }}>
        {/* KPI Cards */}
        <div className="responsive-grid-3" style={{ marginBottom: '24px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E6DFD3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total Vouchers</div>
              <div className="tnum" style={{ fontSize: '26px', fontWeight: 800, color: '#241F18', marginTop: '4px' }}>{totalCount}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#F6F2EC', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#241F18' }}>
              <Tag size={22} />
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E6DFD3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Campaigns</div>
              <div className="tnum" style={{ fontSize: '26px', fontWeight: 800, color: '#16A34A', marginTop: '4px' }}>{activeCount}</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#EBFEF2', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#16A34A' }}>
              <CheckCircle2 size={22} />
            </div>
          </div>

          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '18px 20px', border: '1px solid #E6DFD3', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Max Discount Ratio</div>
              <div className="tnum" style={{ fontSize: '26px', fontWeight: 800, color: 'var(--color-velvet)', marginTop: '4px' }}>{maxDiscount}%</div>
            </div>
            <div style={{ width: '44px', height: '44px', borderRadius: '12px', backgroundColor: '#FFF0E6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-velvet)' }}>
              <Percent size={22} />
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', gap: '16px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-muted)' }} />
            <input
              type="text"
              placeholder="Search code or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 36px',
                borderRadius: '8px',
                border: '1px solid #D8CEBE',
                backgroundColor: '#fff',
                fontSize: '13.5px',
                color: '#241F18',
                outline: 'none'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', backgroundColor: '#E6DFD3', padding: '4px', borderRadius: '8px' }}>
            {(['all', 'active', 'inactive'] as const).map(s => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: filterStatus === s ? '#fff' : 'transparent',
                  color: filterStatus === s ? '#241F18' : 'var(--color-muted)',
                  fontWeight: filterStatus === s ? 700 : 600,
                  fontSize: '12.5px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  boxShadow: filterStatus === s ? '0 1px 3px rgba(0,0,0,0.06)' : 'none'
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Vouchers Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
          {filteredPromos.map(promo => (
            <div
              key={promo.code}
              style={{
                backgroundColor: '#fff',
                borderRadius: '12px',
                border: `1px solid ${promo.active ? '#E6DFD3' : '#E0D7C9'}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                opacity: promo.active ? 1 : 0.65,
                transition: 'all 0.15s ease',
                position: 'relative',
                boxShadow: '0 2px 4px rgba(36,31,24,0.03)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: '14px',
                    fontWeight: 800,
                    padding: '4px 10px',
                    borderRadius: '6px',
                    backgroundColor: promo.active ? '#FFF0E6' : '#F6F2EC',
                    color: promo.active ? 'var(--color-velvet)' : 'var(--color-muted)',
                    border: `1px dashed ${promo.active ? '#F3B49E' : '#D8CEBE'}`,
                    letterSpacing: '0.05em'
                  }}>
                    {promo.code}
                  </span>

                  <button
                    onClick={() => onTogglePromo(promo.code)}
                    style={{
                      padding: '4px 10px',
                      borderRadius: '20px',
                      border: 'none',
                      backgroundColor: promo.active ? '#EBFEF2' : '#F6F2EC',
                      color: promo.active ? '#16A34A' : 'var(--color-muted)',
                      fontSize: '11.5px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {promo.active ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                    {promo.active ? 'Active' : 'Inactive'}
                  </button>
                </div>

                <div style={{ fontSize: '15px', fontWeight: 700, color: '#241F18', marginBottom: '8px', lineHeight: 1.3 }}>
                  {promo.label}
                </div>

                <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', display: 'flex', alignItems: 'center', gap: '16px', marginTop: '12px', padding: '10px 12px', backgroundColor: '#FBF8F3', borderRadius: '8px' }}>
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', display: 'block', color: '#8E8271' }}>Discount</span>
                    <strong style={{ color: '#241F18' }}>
                      {promo.discountType === 'pct' ? `${promo.discountValue}%` : formatIDR(promo.discountValue)}
                    </strong>
                  </div>
                  <div style={{ width: '1px', height: '24px', backgroundColor: '#E6DFD3' }} />
                  <div>
                    <span style={{ fontSize: '11px', textTransform: 'uppercase', display: 'block', color: '#8E8271' }}>Min. Spend</span>
                    <strong style={{ color: '#241F18' }}>
                      {formatIDR(promo.minSpend)}
                    </strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #F1ECE3' }}>
                <button
                  onClick={() => handleOpenEditModal(promo)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid #D8CEBE',
                    backgroundColor: '#fff',
                    color: '#241F18',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Edit size={13} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Are you sure you want to delete promo code "${promo.code}"?`)) {
                      onDeletePromo(promo.code);
                    }
                  }}
                  style={{
                    padding: '6px 10px',
                    borderRadius: '6px',
                    border: '1px solid #F8D7DA',
                    backgroundColor: '#FFF8F8',
                    color: '#DC2626',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}

          {filteredPromos.length === 0 && (
            <div style={{ gridColumn: '1 / -1', padding: '60px 20px', textAlign: 'center', backgroundColor: '#fff', borderRadius: '12px', border: '1px dashed #D8CEBE' }}>
              <Ticket size={40} style={{ color: '#D8CEBE', margin: '0 auto 12px' }} />
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#241F18' }}>No promotions found</div>
              <p style={{ fontSize: '13px', color: 'var(--color-muted)', marginTop: '4px' }}>Try adjusting your search filters or create your first campaign.</p>
            </div>
          )}
        </div>
      </div>

      {/* Campaign Builder Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(36,31,24,0.6)', backdropFilter: 'blur(3px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="responsive-modal-box" style={{ backgroundColor: '#fff', borderRadius: '16px', width: 'min(94vw, 540px)', border: '1px solid #E6DFD3', boxShadow: '0 20px 40px rgba(0,0,0,0.15)', overflow: 'hidden' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #E6DFD3', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#FBF8F3' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Ticket size={18} style={{ color: 'var(--color-velvet)' }} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>
                  {editingPromo ? `Edit Voucher "${editingPromo.code}"` : 'Create New Promo Voucher'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--color-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ padding: '24px' }}>
              {formError && (
                <div style={{ padding: '10px 14px', backgroundColor: '#FFF0F0', border: '1px solid #F8D7DA', borderRadius: '8px', color: '#DC2626', fontSize: '13px', fontWeight: 600, marginBottom: '16px' }}>
                  {formError}
                </div>
              )}

              <div className="responsive-grid-2" style={{ gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#241F18', marginBottom: '6px' }}>
                    Promo Code (Alphanumeric) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. PAYDAY30"
                    disabled={!!editingPromo}
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, ''))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D8CEBE',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '14px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      backgroundColor: editingPromo ? '#F6F2EC' : '#fff',
                      color: editingPromo ? 'var(--color-muted)' : '#241F18'
                    }}
                  />
                  {editingPromo && <span style={{ fontSize: '11px', color: '#8E8271' }}>Code cannot be modified once created</span>}
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#241F18', marginBottom: '6px' }}>
                    Status
                  </label>
                  <button
                    type="button"
                    onClick={() => setFormActive(!formActive)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D8CEBE',
                      backgroundColor: formActive ? '#EBFEF2' : '#F6F2EC',
                      color: formActive ? '#16A34A' : 'var(--color-muted)',
                      fontWeight: 700,
                      fontSize: '13.5px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    {formActive ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                    {formActive ? 'Active Campaign' : 'Inactive / Paused'}
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#241F18', marginBottom: '6px' }}>
                  Description Label *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Diskon Payday 30% (Min. Rp60rb)"
                  value={formLabel}
                  onChange={(e) => setFormLabel(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid #D8CEBE',
                    fontSize: '13.5px',
                    color: '#241F18'
                  }}
                />
              </div>

              <div className="responsive-grid-3" style={{ gap: '12px', marginBottom: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#241F18', marginBottom: '6px' }}>
                    Discount Type
                  </label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as any)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D8CEBE',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      backgroundColor: '#fff'
                    }}
                  >
                    <option value="pct">Percentage (%)</option>
                    <option value="rp">Nominal Rupiah (Rp)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#241F18', marginBottom: '6px' }}>
                    {formType === 'pct' ? 'Percentage (%)' : 'Amount (Rp)'}
                  </label>
                  <input
                    type="number"
                    value={formValue}
                    onChange={(e) => setFormValue(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D8CEBE',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13.5px',
                      fontWeight: 600
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#241F18', marginBottom: '6px' }}>
                    Min. Spend (Rp)
                  </label>
                  <input
                    type="number"
                    value={formMinSpend}
                    onChange={(e) => setFormMinSpend(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #D8CEBE',
                      fontFamily: 'var(--font-mono)',
                      fontSize: '13.5px',
                      fontWeight: 600
                    }}
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div style={{ padding: '16px', backgroundColor: '#FBF8F3', borderRadius: '10px', border: '1px dashed #D8CEBE', marginBottom: '24px' }}>
                <div style={{ fontSize: '11px', fontWeight: 700, color: '#8E8271', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.04em' }}>
                  Kasir POS Drawer Preview
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #E6DFD3' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#FFF0E6', color: 'var(--color-velvet)' }}>
                        {formCode || 'PROMO_CODE'}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--color-muted)' }}>
                        Min. {formatIDR(Number(formMinSpend) || 0)}
                      </span>
                    </div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#241F18', marginTop: '4px' }}>
                      {formLabel || 'Voucher Campaign Description'}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled
                    style={{ padding: '6px 14px', borderRadius: '6px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontWeight: 700, fontSize: '12px' }}
                  >
                    Use
                  </button>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  style={{ padding: '10px 18px', borderRadius: '8px', border: '1px solid #D8CEBE', backgroundColor: '#fff', color: '#241F18', fontWeight: 600, fontSize: '13.5px', cursor: 'pointer' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  style={{ padding: '10px 22px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: 'pointer', boxShadow: '0 2px 6px rgba(193,82,42,0.25)' }}
                >
                  {isSaving ? 'Saving...' : 'Save Voucher'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
