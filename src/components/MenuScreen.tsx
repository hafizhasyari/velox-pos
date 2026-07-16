import React, { useState } from 'react';
import type { Category, MenuItem, ModifierGroup } from '../types/pos';
import { formatIDR } from '../data/initialData';
import { Plus, Edit2, Archive, CheckCircle2, X } from 'lucide-react';

interface MenuScreenProps {
  categories: Category[];
  onSaveCategory: (name: string) => void;
  onSaveItem: (item: MenuItem) => void;
  onToggleArchive: (item: MenuItem) => void;
}

export const MenuScreen: React.FC<MenuScreenProps> = ({
  categories,
  onSaveCategory,
  onSaveItem,
  onToggleArchive
}) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(categories[0]?.id || '');
  const [search, setSearch] = useState('');

  // Modals state
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');

  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Draft modifiers inside item modal
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupRequired, setNewGroupRequired] = useState(false);
  const [newOptionNameByGroup, setNewOptionNameByGroup] = useState<Record<string, string>>({});
  const [newOptionPriceByGroup, setNewOptionPriceByGroup] = useState<Record<string, string>>({});

  const activeCategory = categories.find(c => c.id === activeCategoryId) || categories[0];
  const searchLower = search.trim().toLowerCase();
  const filteredItems = (activeCategory?.items || []).filter(it =>
    !searchLower || it.name.toLowerCase().includes(searchLower)
  );

  const openNewItemModal = () => {
    setEditingItem({
      id: '',
      name: '',
      price: 0,
      active: true,
      categoryId: activeCategoryId,
      modifierGroups: []
    });
    setShowItemModal(true);
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(JSON.parse(JSON.stringify(item)));
    setShowItemModal(true);
  };

  const handleSaveItemSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem || !editingItem.name.trim() || !editingItem.price) {
      alert('Name and price are required.');
      return;
    }
    onSaveItem(editingItem);
    setShowItemModal(false);
    setEditingItem(null);
  };

  const addModifierGroup = () => {
    if (!editingItem || !newGroupName.trim()) return;
    const newGroup: ModifierGroup = {
      id: 'g_' + Date.now(),
      name: newGroupName.trim(),
      required: newGroupRequired,
      multi: !newGroupRequired,
      options: []
    };
    setEditingItem({
      ...editingItem,
      modifierGroups: [...editingItem.modifierGroups, newGroup]
    });
    setNewGroupName('');
    setNewGroupRequired(false);
  };

  const removeModifierGroup = (groupId: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      modifierGroups: editingItem.modifierGroups.filter(g => g.id !== groupId)
    });
  };

  const addOptionToGroup = (groupId: string) => {
    if (!editingItem) return;
    const optName = (newOptionNameByGroup[groupId] || '').trim();
    const optPrice = Number(newOptionPriceByGroup[groupId] || 0);
    if (!optName) return;

    setEditingItem({
      ...editingItem,
      modifierGroups: editingItem.modifierGroups.map(g => {
        if (g.id !== groupId) return g;
        return {
          ...g,
          options: [...g.options, { id: 'o_' + Date.now() + Math.random().toString(36).slice(2, 4), name: optName, priceDelta: optPrice }]
        };
      })
    });
    setNewOptionNameByGroup({ ...newOptionNameByGroup, [groupId]: '' });
    setNewOptionPriceByGroup({ ...newOptionPriceByGroup, [groupId]: '' });
  };

  const removeOptionFromGroup = (groupId: string, optionId: string) => {
    if (!editingItem) return;
    setEditingItem({
      ...editingItem,
      modifierGroups: editingItem.modifierGroups.map(g => {
        if (g.id !== groupId) return g;
        return { ...g, options: g.options.filter(o => o.id !== optionId) };
      })
    });
  };

  const handleSaveCategorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    onSaveCategory(newCategoryName.trim());
    setNewCategoryName('');
    setShowCategoryModal(false);
  };

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1180px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Menu Management</h1>
          <div style={{ fontSize: '13px', color: 'var(--color-muted)' }}>Categories, items, and modifiers</div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowCategoryModal(true)}
            style={{
              padding: '9px 14px',
              borderRadius: '7px',
              border: '1px solid #D8CEBE',
              backgroundColor: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              color: '#241F18',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} /> Category
          </button>
          <button
            onClick={openNewItemModal}
            style={{
              padding: '9px 14px',
              borderRadius: '7px',
              border: 'none',
              backgroundColor: 'var(--color-velvet)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Plus size={15} /> Item
          </button>
        </div>
      </div>

      <div className="responsive-grid-2" style={{ gap: '20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {categories.map((cat) => {
            const isSel = cat.id === activeCategoryId;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategoryId(cat.id)}
                style={{
                  textAlign: 'left',
                  padding: '10px 12px',
                  borderRadius: '7px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  backgroundColor: isSel ? 'var(--color-velvet)' : '#fff',
                  color: isSel ? '#fff' : 'var(--color-muted)',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}
              >
                <span>{cat.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', opacity: 0.7 }}>
                  {cat.items.length}
                </span>
              </button>
            );
          })}
        </div>

        <div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search items in this category..."
            style={{
              width: '100%',
              padding: '10px 12px',
              border: '1px solid #D8CEBE',
              borderRadius: '7px',
              fontSize: '13.5px',
              marginBottom: '14px',
              backgroundColor: '#fff'
            }}
          />

          <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '10px', overflow: 'hidden' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 14px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-placeholder)',
              textTransform: 'uppercase',
              letterSpacing: '0.03em',
              borderBottom: '1px solid #E6DFD3'
            }}>
              <span style={{ flex: 1, minWidth: 0 }}>Item</span>
              <span style={{ width: '80px', flexShrink: 0 }}>Price</span>
              <span style={{ width: '60px', flexShrink: 0 }}>Mods</span>
              <span style={{ width: '70px', flexShrink: 0 }}>Status</span>
              <span style={{ width: '64px', flexShrink: 0 }}></span>
            </div>

            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '11px 14px',
                  borderBottom: '1px solid #F1ECE3',
                  fontSize: '13px'
                }}
              >
                <span style={{
                  flex: 1,
                  minWidth: 0,
                  fontWeight: 500,
                  opacity: item.active ? 1 : 0.45,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {item.name}
                </span>
                <span className="tnum" style={{
                  width: '80px',
                  flexShrink: 0,
                  fontFamily: 'var(--font-mono)',
                  fontSize: '12px',
                  opacity: item.active ? 1 : 0.45
                }}>
                  {formatIDR(item.price)}
                </span>
                <span style={{ width: '60px', flexShrink: 0, color: 'var(--color-muted)', fontSize: '12px' }}>
                  {item.modifierGroups.length ? `${item.modifierGroups.length} grp` : '—'}
                </span>
                <span style={{ width: '70px', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '10.5px',
                    fontWeight: 600,
                    padding: '3px 7px',
                    borderRadius: '5px',
                    backgroundColor: item.active ? '#E7EFE4' : '#F1ECE3',
                    color: item.active ? 'var(--color-success-text)' : 'var(--color-placeholder)',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.active ? 'Active' : 'Archived'}
                  </span>
                </span>
                <div style={{ width: '64px', flexShrink: 0, display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => openEditModal(item)}
                    title="Edit"
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      border: '1px solid #D8CEBE',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      color: '#241F18',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    <Edit2 size={13} />
                  </button>
                  <button
                    onClick={() => onToggleArchive(item)}
                    title={item.active ? 'Archive' : 'Restore'}
                    style={{
                      width: '26px',
                      height: '26px',
                      borderRadius: '5px',
                      border: '1px solid #D8CEBE',
                      backgroundColor: '#fff',
                      cursor: 'pointer',
                      color: '#241F18',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 0
                    }}
                  >
                    {item.active ? <Archive size={13} /> : <CheckCircle2 size={13} />}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Item Modal */}
      {showItemModal && editingItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(36, 31, 24, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          animation: 'voFadeIn 0.15s ease'
        }}>
          <form onSubmit={handleSaveItemSubmit} className="responsive-modal-box" style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '26px',
            width: 'min(94vw, 440px)',
            maxHeight: '86vh',
            overflowY: 'auto',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ fontSize: '15px', fontWeight: 700, marginBottom: '18px' }}>
              {editingItem.id ? 'Edit item' : 'New item'}
            </div>

            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
              Name
            </label>
            <input
              type="text"
              value={editingItem.name}
              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '7px', fontSize: '13.5px', marginBottom: '14px' }}
              required
            />

            <div className="responsive-grid-2" style={{ gap: '12px', marginBottom: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                  Price (Rp)
                </label>
                <input
                  type="number"
                  value={editingItem.price || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '7px', fontSize: '13.5px' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--color-muted)', marginBottom: '6px' }}>
                  Category
                </label>
                <select
                  value={editingItem.categoryId || activeCategoryId}
                  onChange={(e) => setEditingItem({ ...editingItem, categoryId: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '7px', fontSize: '13.5px', backgroundColor: '#fff' }}
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', marginBottom: '20px', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={editingItem.active}
                onChange={(e) => setEditingItem({ ...editingItem, active: e.target.checked })}
              /> Active on POS
            </label>

            <div style={{ borderTop: '1px solid #E6DFD3', paddingTop: '16px', marginBottom: '16px' }}>
              <div style={{ fontSize: '12.5px', fontWeight: 600, marginBottom: '10px' }}>Modifier groups</div>

              {editingItem.modifierGroups.map((g) => (
                <div key={g.id} style={{ backgroundColor: '#FBF8F3', border: '1px solid #E6DFD3', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12.5px', fontWeight: 600 }}>
                      {g.name} <span style={{ color: 'var(--color-placeholder)', fontWeight: 400 }}>· {g.required ? 'required' : 'optional'}</span>
                    </span>
                    <button type="button" onClick={() => removeModifierGroup(g.id)} style={{ border: 'none', background: 'none', color: 'var(--color-danger-text)', fontSize: '11px', cursor: 'pointer' }}>
                      Remove
                    </button>
                  </div>

                  {g.options.map((opt) => (
                    <div key={opt.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '4px 0' }}>
                      <span>{opt.name}</span>
                      <span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <span className="tnum" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-muted)' }}>+{formatIDR(opt.priceDelta)}</span>
                        <button type="button" onClick={() => removeOptionFromGroup(g.id, opt.id)} style={{ border: 'none', background: 'none', color: 'var(--color-danger-text)', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>
                          ×
                        </button>
                      </span>
                    </div>
                  ))}

                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <input
                      type="text"
                      value={newOptionNameByGroup[g.id] || ''}
                      onChange={(e) => setNewOptionNameByGroup({ ...newOptionNameByGroup, [g.id]: e.target.value })}
                      placeholder="Option name"
                      style={{ flex: 1, padding: '6px 8px', border: '1px solid #D8CEBE', borderRadius: '5px', fontSize: '11.5px' }}
                    />
                    <input
                      type="number"
                      value={newOptionPriceByGroup[g.id] || ''}
                      onChange={(e) => setNewOptionPriceByGroup({ ...newOptionPriceByGroup, [g.id]: e.target.value })}
                      placeholder="+Rp"
                      style={{ width: '70px', padding: '6px 8px', border: '1px solid #D8CEBE', borderRadius: '5px', fontSize: '11.5px' }}
                    />
                    <button type="button" onClick={() => addOptionToGroup(g.id)} style={{ padding: '6px 10px', border: 'none', backgroundColor: '#241F18', color: '#fff', borderRadius: '5px', fontSize: '11px', cursor: 'pointer' }}>
                      Add
                    </button>
                  </div>
                </div>
              ))}

              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="New group name"
                  style={{ flex: 1, padding: '7px 9px', border: '1px solid #D8CEBE', borderRadius: '5px', fontSize: '12px' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--color-muted)', whiteSpace: 'nowrap' }}>
                  <input type="checkbox" checked={newGroupRequired} onChange={(e) => setNewGroupRequired(e.target.checked)} />
                  Required
                </label>
                <button type="button" onClick={addModifierGroup} style={{ padding: '7px 11px', border: '1px solid #D8CEBE', backgroundColor: '#fff', borderRadius: '5px', fontSize: '11px', cursor: 'pointer', color: '#241F18' }}>
                  + Group
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowItemModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #D8CEBE', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#241F18' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save item
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category Modal */}
      {showCategoryModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(36, 31, 24, 0.45)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 60,
          animation: 'voFadeIn 0.15s ease'
        }}>
          <form onSubmit={handleSaveCategorySubmit} className="responsive-modal-box" style={{
            backgroundColor: '#fff',
            borderRadius: '12px',
            padding: '26px',
            width: 'min(94vw, 340px)',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.25)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <span style={{ fontSize: '15px', fontWeight: 700 }}>New category</span>
              <button type="button" onClick={() => setShowCategoryModal(false)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="e.g. Desserts"
              style={{ width: '100%', padding: '10px 12px', border: '1px solid #D8CEBE', borderRadius: '7px', fontSize: '13.5px', marginBottom: '18px' }}
              required
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: '1px solid #D8CEBE', backgroundColor: '#fff', fontSize: '13px', fontWeight: 600, cursor: 'pointer', color: '#241F18' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                style={{ flex: 1, padding: '11px', borderRadius: '8px', border: 'none', backgroundColor: 'var(--color-velvet)', color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}
              >
                Save
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
