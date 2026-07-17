import React, { useState } from 'react';
import type { TenantConfig, UserAccount } from '../types/pos';
import { formatIDR } from '../data/initialData';
import { Settings, Percent, Save, ToggleLeft, ToggleRight, CheckCircle2, Users, UserPlus, Trash2, ShieldAlert } from 'lucide-react';
import { AlertNotification } from './AlertNotification';

interface SettingsScreenProps {
  tenantConfig: TenantConfig;
  users: UserAccount[];
  onUpdate: (config: Partial<TenantConfig>) => Promise<void>;
  onAddStaff: (name: string, email: string) => Promise<void>;
  onDeleteStaff: (id: string) => Promise<void>;
}

const PRESET_RATES = [
  { label: '0%', value: 0, desc: 'Dikecualikan / Non-PKP' },
  { label: '10%', value: 0.1, desc: 'Tarif historis (pra-2022)' },
  { label: '11%', value: 0.11, desc: 'UU HPP No. 7/2021 (berlaku)' },
  { label: '12%', value: 0.12, desc: 'Tarif rencana berikutnya' },
];

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ tenantConfig, users, onUpdate, onAddStaff, onDeleteStaff }) => {
  const [activeTab, setActiveTab] = useState<'tax' | 'staff'>('tax');

  // Tax State
  const [taxEnabled, setTaxEnabled] = useState(tenantConfig.taxEnabled);
  const [taxRate, setTaxRate] = useState(tenantConfig.taxRate);
  const [taxLabel, setTaxLabel] = useState(tenantConfig.taxLabel);
  const [customInput, setCustomInput] = useState('');
  
  // Staff State
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  
  // Global UI State
  const [isSaving, setIsSaving] = useState(false);
  const [savedAlert, setSavedAlert] = useState<string | null>(null);
  const [errorAlert, setErrorAlert] = useState<string | null>(null);

  // Preview with sample 100000 subtotal
  const PREVIEW_SUBTOTAL = 100000;
  const previewTax = Math.round(PREVIEW_SUBTOTAL * (taxEnabled ? taxRate : 0));
  const previewTotal = PREVIEW_SUBTOTAL + previewTax;

  const selectPreset = (value: number) => {
    setTaxRate(value);
    setCustomInput('');
    const pct = (value * 100).toFixed(0);
    setTaxLabel(value === 0 ? 'Bebas Pajak' : `PPN ${pct}%`);
  };

  const handleCustomInput = (val: string) => {
    setCustomInput(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num >= 0 && num <= 100) {
      setTaxRate(num / 100);
      setTaxLabel(num === 0 ? 'Bebas Pajak' : `PPN ${num}%`);
    }
  };

  const handleSaveTax = async () => {
    setIsSaving(true);
    setSavedAlert(null);
    setErrorAlert(null);
    try {
      await onUpdate({ taxEnabled, taxRate, taxLabel });
      setSavedAlert('Konfigurasi PPN berhasil disimpan.');
    } catch {
      setErrorAlert('Gagal menyimpan konfigurasi pajak.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;
    
    setIsSaving(true);
    setSavedAlert(null);
    setErrorAlert(null);
    try {
      await onAddStaff(newStaffName, newStaffEmail);
      setNewStaffName('');
      setNewStaffEmail('');
      setSavedAlert(`Kasir ${newStaffName} berhasil ditambahkan.`);
    } catch (err: any) {
      setErrorAlert(err.message || 'Gagal menambahkan staff.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteStaff = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus Kasir ${name}?`)) return;
    
    setSavedAlert(null);
    setErrorAlert(null);
    try {
      await onDeleteStaff(id);
      setSavedAlert(`Kasir ${name} berhasil dihapus.`);
    } catch (err: any) {
      setErrorAlert(err.message || 'Gagal menghapus staff.');
    }
  };

  const isPresetSelected = (value: number) => Math.abs(taxRate - value) < 0.0001;

  return (
    <div style={{ padding: '32px 36px', maxWidth: '860px', width: '100%', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Settings size={24} color="var(--color-velvet)" />
            Pengaturan
          </h1>
          <div style={{ fontSize: '13.5px', color: 'var(--color-muted)' }}>Kelola konfigurasi dan hak akses tenant Anda</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid #E6DFD3', marginBottom: '24px' }}>
        <button
          onClick={() => setActiveTab('tax')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'tax' ? '2.5px solid var(--color-velvet)' : '2.5px solid transparent',
            color: activeTab === 'tax' ? 'var(--color-velvet)' : 'var(--color-muted)',
            fontWeight: activeTab === 'tax' ? 700 : 600,
            fontSize: '14.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Percent size={18} />
          Pajak & Pembayaran
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          style={{
            padding: '12px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'staff' ? '2.5px solid var(--color-velvet)' : '2.5px solid transparent',
            color: activeTab === 'staff' ? 'var(--color-velvet)' : 'var(--color-muted)',
            fontWeight: activeTab === 'staff' ? 700 : 600,
            fontSize: '14.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.15s ease'
          }}
        >
          <Users size={18} />
          Manajemen Staff
        </button>
      </div>

      {savedAlert && (
        <AlertNotification
          title="Berhasil ✓"
          message={savedAlert}
          type="warning"
          onClose={() => setSavedAlert(null)}
        />
      )}
      {errorAlert && (
        <AlertNotification
          title="Terjadi Kesalahan"
          message={errorAlert}
          type="error"
          onClose={() => setErrorAlert(null)}
        />
      )}

      {/* TAB: TAX CONFIG */}
      {activeTab === 'tax' && (
        <>
          <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(36,31,24,0.04)', marginBottom: '20px' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EAE1', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FBF3EE', border: '1px solid #ECD9CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Percent size={18} color="var(--color-velvet)" />
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#241F18' }}>Konfigurasi PPN</div>
                  <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '1px' }}>Pajak Pertambahan Nilai (VAT)</div>
                </div>
              </div>
              <button
                onClick={() => setTaxEnabled(!taxEnabled)}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '8px', border: '1px solid', borderColor: taxEnabled ? 'var(--color-velvet)' : '#D8CEBE', backgroundColor: taxEnabled ? '#FBF3EE' : '#F6F2EC', cursor: 'pointer', fontSize: '13px', fontWeight: 700, color: taxEnabled ? 'var(--color-velvet)' : 'var(--color-muted)', transition: 'all 0.15s ease' }}
              >
                {taxEnabled
                  ? <><ToggleRight size={20} />PPN Aktif</>
                  : <><ToggleLeft size={20} />PPN Nonaktif</>
                }
              </button>
            </div>

            <div style={{ padding: '24px', opacity: taxEnabled ? 1 : 0.45, pointerEvents: taxEnabled ? 'auto' : 'none', transition: 'opacity 0.2s ease' }}>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '10px' }}>
                  Pilih Tarif Cepat
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                  {PRESET_RATES.map((preset) => (
                    <button
                      key={preset.value}
                      onClick={() => selectPreset(preset.value)}
                      style={{
                        padding: '12px 10px',
                        borderRadius: '10px',
                        border: '1.5px solid',
                        borderColor: isPresetSelected(preset.value) ? 'var(--color-velvet)' : '#E6DFD3',
                        backgroundColor: isPresetSelected(preset.value) ? '#FBF3EE' : '#fff',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        textAlign: 'center',
                        position: 'relative'
                      }}
                    >
                      {isPresetSelected(preset.value) && (
                        <CheckCircle2 size={13} color="var(--color-velvet)" style={{ position: 'absolute', top: '6px', right: '6px' }} />
                      )}
                      <div style={{ fontSize: '20px', fontWeight: 700, color: isPresetSelected(preset.value) ? 'var(--color-velvet)' : '#241F18', fontFamily: 'var(--font-mono)' }}>
                        {preset.label}
                      </div>
                      <div style={{ fontSize: '10.5px', color: 'var(--color-muted)', marginTop: '3px', lineHeight: 1.3 }}>
                        {preset.desc}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Atau Masukkan Tarif Kustom (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input
                    type="number"
                    value={customInput}
                    onChange={(e) => handleCustomInput(e.target.value)}
                    placeholder={`${(taxRate * 100).toFixed(1)}`}
                    min="0"
                    max="100"
                    step="0.1"
                    style={{ width: '140px', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '8px', fontSize: '15px', fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#241F18' }}
                  />
                  <span style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-muted)' }}>%</span>
                  <span style={{ fontSize: '12px', color: 'var(--color-muted)' }}>
                    Tarif aktif: <strong style={{ color: '#241F18', fontFamily: 'var(--font-mono)' }}>{(taxRate * 100).toFixed(1)}%</strong>
                  </span>
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '8px' }}>
                  Label di Struk & Tagihan
                </label>
                <input
                  type="text"
                  value={taxLabel}
                  onChange={(e) => setTaxLabel(e.target.value)}
                  placeholder="e.g. PPN 11%, Tax, Pajak"
                  style={{ width: '100%', maxWidth: '300px', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '8px', fontSize: '14px', color: '#241F18' }}
                />
              </div>

              <div style={{ backgroundColor: '#FBF8F3', border: '1px solid #E6DFD3', borderRadius: '10px', padding: '16px 18px' }}>
                <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '12px' }}>
                  Preview Kalkulasi (Subtotal Rp100.000)
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-muted)' }}>Subtotal</span>
                    <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{formatIDR(PREVIEW_SUBTOTAL)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--color-muted)' }}>{taxLabel} ({(taxRate * 100).toFixed(0)}%)</span>
                    <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontWeight: 600, color: taxEnabled ? 'var(--color-velvet)' : 'var(--color-muted)' }}>
                      {taxEnabled ? `+${formatIDR(previewTax)}` : 'Rp0 (nonaktif)'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '15px', borderTop: '1px solid #E6DFD3', paddingTop: '8px', marginTop: '2px' }}>
                    <span>Total</span>
                    <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-velvet)' }}>{formatIDR(previewTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ padding: '16px 24px', borderTop: '1px solid #F0EAE1', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
              <span style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>Perubahan berlaku untuk transaksi berikutnya</span>
              <button
                onClick={handleSaveTax}
                disabled={isSaving}
                style={{
                  display: 'flex', alignItems: 'center', gap: '7px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: isSaving ? 'not-allowed' : 'pointer', opacity: isSaving ? 0.7 : 1, boxShadow: '0 2px 6px rgba(193,82,42,0.25)', transition: 'all 0.15s ease'
                }}
              >
                <Save size={15} />
                {isSaving ? 'Menyimpan...' : 'Simpan Konfigurasi'}
              </button>
            </div>
          </div>
          
          <div style={{ backgroundColor: '#FBF8F3', border: '1px solid #E6DFD3', borderRadius: '12px', padding: '16px 20px' }}>
            <div style={{ fontSize: '12.5px', color: 'var(--color-muted)', lineHeight: 1.65 }}>
              <strong style={{ color: '#241F18' }}>📋 Regulasi PPN Indonesia:</strong> Tarif PPN saat ini adalah <strong>11%</strong> sesuai UU HPP No. 7/2021 yang berlaku mulai 1 April 2022. UMKM dengan omset tahunan di bawah <strong>Rp500 juta</strong> umumnya dikecualikan dari kewajiban PPN (Non-PKP). Konsultasikan dengan konsultan pajak Anda untuk kepastian kewajiban perpajakan bisnis Anda.
            </div>
          </div>
        </>
      )}

      {/* TAB: STAFF MANAGEMENT */}
      {activeTab === 'staff' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
          
          {/* Staff List */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(36,31,24,0.04)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #F0EAE1', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', backgroundColor: '#FBF3EE', border: '1px solid #ECD9CC', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={18} color="var(--color-velvet)" />
              </div>
              <div>
                <div style={{ fontSize: '15px', fontWeight: 700, color: '#241F18' }}>Daftar Kasir & Staff</div>
                <div style={{ fontSize: '12px', color: 'var(--color-muted)', marginTop: '1px' }}>Kelola akses pengguna ke aplikasi POS</div>
              </div>
            </div>
            
            <div style={{ padding: '0' }}>
              {users.length === 0 ? (
                <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--color-muted)', fontSize: '14px' }}>
                  Belum ada data staff.
                </div>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {users.map((user, idx) => (
                    <li key={user.id} style={{ padding: '16px 24px', borderBottom: idx < users.length - 1 ? '1px solid #F0EAE1' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'background-color 0.15s ease' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        <div style={{ width: '42px', height: '42px', borderRadius: '21px', backgroundColor: user.role === 'owner' ? 'var(--color-velvet)' : '#E6DFD3', color: user.role === 'owner' ? '#fff' : '#241F18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: 700 }}>
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: '14.5px', fontWeight: 600, color: '#241F18', marginBottom: '2px' }}>{user.name}</div>
                          <div style={{ fontSize: '12.5px', color: 'var(--color-muted)' }}>{user.email}</div>
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.04em',
                          backgroundColor: user.role === 'owner' ? 'rgba(162, 63, 29, 0.1)' : '#F6F2EC',
                          color: user.role === 'owner' ? 'var(--color-velvet)' : '#7C7160',
                          border: `1px solid ${user.role === 'owner' ? 'rgba(162, 63, 29, 0.2)' : '#E6DFD3'}`
                        }}>
                          {user.role}
                        </span>
                        
                        {user.role === 'kasir' ? (
                          <button
                            onClick={() => handleDeleteStaff(user.id, user.name)}
                            style={{
                              background: 'none', border: 'none', padding: '6px', cursor: 'pointer', color: 'var(--color-danger-text)', opacity: 0.7, transition: 'opacity 0.2s ease', display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}
                            title="Hapus Kasir"
                            onMouseOver={(e) => e.currentTarget.style.opacity = '1'}
                            onMouseOut={(e) => e.currentTarget.style.opacity = '0.7'}
                          >
                            <Trash2 size={18} />
                          </button>
                        ) : (
                          <div style={{ width: '30px' }}></div>
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          {/* Add Staff Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <form onSubmit={handleAddStaff} style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 1px 4px rgba(36,31,24,0.04)' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid #F0EAE1', backgroundColor: '#FBF8F3' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#241F18', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <UserPlus size={16} color="var(--color-velvet)" />
                  Tambah Kasir Baru
                </h3>
              </div>
              
              <div style={{ padding: '20px' }}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '6px' }}>
                    NAMA LENGKAP
                  </label>
                  <input
                    type="text"
                    value={newStaffName}
                    onChange={(e) => setNewStaffName(e.target.value)}
                    placeholder="e.g. Budi Rahardjo"
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '8px', fontSize: '14px', color: '#241F18' }}
                  />
                </div>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--color-muted)', marginBottom: '6px' }}>
                    EMAIL KASIR
                  </label>
                  <input
                    type="email"
                    value={newStaffEmail}
                    onChange={(e) => setNewStaffEmail(e.target.value)}
                    placeholder="e.g. budi@warung.id"
                    required
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '8px', fontSize: '14px', color: '#241F18' }}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSaving || !newStaffName || !newStaffEmail}
                  style={{
                    width: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontWeight: 700, fontSize: '13.5px', cursor: (isSaving || !newStaffName || !newStaffEmail) ? 'not-allowed' : 'pointer', opacity: (isSaving || !newStaffName || !newStaffEmail) ? 0.7 : 1, transition: 'all 0.15s ease'
                  }}
                >
                  <UserPlus size={15} />
                  {isSaving ? 'Menyimpan...' : 'Tambah Kasir'}
                </button>
              </div>
            </form>
            
            <div style={{ backgroundColor: '#F6F2EC', border: '1px solid #E6DFD3', borderRadius: '12px', padding: '16px', display: 'flex', gap: '12px' }}>
              <ShieldAlert size={20} color="var(--color-muted)" style={{ flexShrink: 0 }} />
              <div style={{ fontSize: '12px', color: 'var(--color-muted)', lineHeight: 1.5 }}>
                <strong style={{ color: '#241F18' }}>Role & Permission:</strong> Kasir memiliki akses ke Order/POS, KDS, dan Shift. Kasir tidak dapat melihat menu Settings, laporan Dashboard, dan tidak dapat mengubah master data Menu.
              </div>
            </div>
          </div>
          
        </div>
      )}
    </div>
  );
};
