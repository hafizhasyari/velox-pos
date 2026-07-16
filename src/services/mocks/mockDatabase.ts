import type { Category, TableItem, ShiftRecord, KitchenTicketStatus, VoucherPromo } from '../../types/pos';
import { buildInitialMenu, buildInitialTables } from '../../data/initialData';

const DB_KEY = 'velox_db_v1';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'kasir';
  tenantId: string;
}

export interface OrderRecord {
  id: string;
  ticketNo: string;
  type: 'dinein' | 'takeaway';
  tableNumber: number | null;
  items: Array<{ name: string; qty: number; price: number; modNames: string[] }>;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: 'cash' | 'qris';
  cashTendered?: number;
  change?: number;
  createdAt: string;
  kdsStatus?: KitchenTicketStatus;
}

export interface CurrentShiftState {
  open: boolean;
  openingCash: number;
  expectedCash: number;
  ordersCount: number;
  openedAt: string;
}

export interface MockDatabaseSchema {
  tenantId: string;
  tenantName: string;
  users: UserAccount[];
  categories: Category[];
  tables: TableItem[];
  currentShift: CurrentShiftState;
  shiftHistory: ShiftRecord[];
  orders: OrderRecord[];
  promotions: VoucherPromo[];
}

function getInitialDatabase(): MockDatabaseSchema {
  return {
    tenantId: 't_warung_sari_01',
    tenantName: 'Warung Makan Ibu Sari',
    users: [
      { id: 'u_owner', email: 'owner@warungibusari.id', name: 'Ibu Sari', role: 'owner', tenantId: 't_warung_sari_01' },
      { id: 'u_kasir', email: 'kasir@warungibusari.id', name: 'Rizky (Kasir 1)', role: 'kasir', tenantId: 't_warung_sari_01' }
    ],
    categories: buildInitialMenu(),
    tables: buildInitialTables(),
    currentShift: {
      open: true,
      openingCash: 200000,
      expectedCash: 540000,
      ordersCount: 14,
      openedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    shiftHistory: [
      { id: 'sh1', date: 'Yesterday (Shift 2)', opening: 200000, expected: 1840000, counted: 1840000, variance: 0, orders: 42 },
      { id: 'sh2', date: 'Yesterday (Shift 1)', opening: 150000, expected: 1120000, counted: 1115000, variance: -5000, orders: 28 },
      { id: 'sh3', date: '2 Days Ago', opening: 200000, expected: 2450000, counted: 2450000, variance: 0, orders: 65 }
    ],
    orders: [
      {
        id: 'o_101',
        ticketNo: 'ORD-1042',
        type: 'dinein',
        tableNumber: 4,
        items: [{ name: 'Nasi Goreng Spesial', qty: 2, price: 33000, modNames: ['Pedas Sedang', '+ Telur Mata Sapi'] }],
        subtotal: 66000,
        discount: 0,
        tax: 6600,
        total: 72600,
        paymentMethod: 'cash',
        cashTendered: 100000,
        change: 27400,
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        kdsStatus: 'new'
      }
    ],
    promotions: [
      { code: 'HEMAT20', label: 'Diskon 20% (Min. Rp50rb)', discountType: 'pct', discountValue: 20, minSpend: 50000, active: true },
      { code: 'WARUNG50RB', label: 'Potongan Rp50.000 (Min. Rp200rb)', discountType: 'rp', discountValue: 50000, minSpend: 200000, active: true },
      { code: 'GRATISKOPI', label: 'Diskon Rp15.000 Minuman (Min. Rp40rb)', discountType: 'rp', discountValue: 15000, minSpend: 40000, active: true }
    ]
  };
}

export const MockDatabase = {
  get(): MockDatabaseSchema {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) {
        const initial = getInitialDatabase();
        localStorage.setItem(DB_KEY, JSON.stringify(initial));
        return initial;
      }
      const data = JSON.parse(raw) as MockDatabaseSchema;
      if (!data.promotions) {
        data.promotions = getInitialDatabase().promotions;
      }
      data.orders = (data.orders || []).map(o => ({
        ...o,
        kdsStatus: o.kdsStatus || 'new'
      }));
      return data;
    } catch {
      const initial = getInitialDatabase();
      return initial;
    }
  },

  save(data: MockDatabaseSchema): void {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save MockDatabase to LocalStorage:', err);
    }
  },

  reset(): MockDatabaseSchema {
    const initial = getInitialDatabase();
    localStorage.setItem(DB_KEY, JSON.stringify(initial));
    return initial;
  }
};
