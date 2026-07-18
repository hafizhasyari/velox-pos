import type { Category, TableItem, ShiftRecord, KitchenTicketStatus, VoucherPromo, TenantConfig, UserAccount, Role, Permission } from '../../types/pos';
import { buildInitialMenu, buildInitialTables } from '../../data/initialData';

const DB_KEY = 'velox_db_v1';

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
  tenantConfig: TenantConfig;
  users: UserAccount[];
  roles: Role[];
  permissions: Permission[];
  categories: Category[];
  tables: TableItem[];
  currentShift: CurrentShiftState;
  shiftHistory: ShiftRecord[];
  orders: OrderRecord[];
  promotions: VoucherPromo[];
}

function getInitialDatabase(): MockDatabaseSchema {
  const tenantId = 't_warung_sari_01';
  const now = new Date().toISOString();
  
  return {
    tenantId: tenantId,
    tenantName: 'Warung Makan Ibu Sari',
    tenantConfig: {
      taxRate: 0.11,
      taxEnabled: true,
      taxLabel: 'PPN 11%'
    },
    users: [
      { id: 'u_owner', email: 'owner@warungibusari.id', name: 'Ibu Sari', roleId: 'owner', role: 'owner', tenantId: tenantId },
      { id: 'u_kasir', email: 'kasir@warungibusari.id', name: 'Rizky (Kasir 1)', roleId: 'kasir', role: 'kasir', tenantId: tenantId },
      { id: 'u_manager', email: 'manager@warungibusari.id', name: 'Andi (Manager)', roleId: 'manager', tenantId: tenantId },
      { id: 'u_kitchen', email: 'kitchen@warungibusari.id', name: 'Budi (Kitchen)', roleId: 'kitchen', tenantId: tenantId },
      { id: 'u_waiter', email: 'waiter@warungibusari.id', name: 'Citra (Waiter)', roleId: 'waiter', tenantId: tenantId }
    ],
    roles: [
      {
        id: 'owner',
        name: 'Owner',
        description: 'Full access ke semua fitur sistem',
        permissions: ['dashboard', 'menu', 'promotions', 'pos', 'kds', 'shift', 'settings'],
        isSystem: true,
        isEditable: false,
        isDeletable: false,
        tenantId: tenantId,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'kasir',
        name: 'Kasir',
        description: 'Kasir utama - Handle transaksi, shift, dan dapur',
        permissions: ['pos', 'kds', 'shift'],
        isSystem: false,
        isEditable: true,
        isDeletable: true,
        tenantId: tenantId,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'manager',
        name: 'Manager',
        description: 'Manager operasional - Semua akses kecuali settings sistem',
        permissions: ['dashboard', 'menu', 'promotions', 'pos', 'kds', 'shift'],
        isSystem: false,
        isEditable: true,
        isDeletable: true,
        tenantId: tenantId,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'kitchen',
        name: 'Kitchen Staff',
        description: 'Staff dapur - Hanya akses KDS untuk manage order masakan',
        permissions: ['kds'],
        isSystem: false,
        isEditable: true,
        isDeletable: true,
        tenantId: tenantId,
        createdAt: now,
        updatedAt: now,
      },
      {
        id: 'waiter',
        name: 'Waiter',
        description: 'Pelayan - Input order dan cek status di dapur',
        permissions: ['pos', 'kds'],
        isSystem: false,
        isEditable: true,
        isDeletable: true,
        tenantId: tenantId,
        createdAt: now,
        updatedAt: now,
      },
    ],
    permissions: [
      {
        id: 'dashboard',
        screen: 'dashboard',
        label: 'Dashboard',
        description: 'Lihat analytics & laporan penjualan',
        icon: 'LayoutDashboard'
      },
      {
        id: 'menu',
        screen: 'menu',
        label: 'Menu Management',
        description: 'Kelola menu, kategori, dan harga',
        icon: 'Utensils'
      },
      {
        id: 'promotions',
        screen: 'promotions',
        label: 'Vouchers & Promo',
        description: 'Kelola diskon, voucher, dan promosi',
        icon: 'Ticket'
      },
      {
        id: 'pos',
        screen: 'pos',
        label: 'Order / POS',
        description: 'Terima dan proses order pelanggan',
        icon: 'ShoppingCart'
      },
      {
        id: 'kds',
        screen: 'kds',
        label: 'KDS / Kitchen',
        description: 'Kelola antrian dapur dan status masakan',
        icon: 'ChefHat'
      },
      {
        id: 'shift',
        screen: 'shift',
        label: 'Shift Management',
        description: 'Buka/tutup shift dan kelola kas kasir',
        icon: 'Clock'
      },
      {
        id: 'settings',
        screen: 'settings',
        label: 'Settings',
        description: 'Pengaturan sistem, pajak, dan staff',
        icon: 'Settings'
      },
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
      
      // Migration: Add roles and permissions if missing
      if (!data.roles) {
        data.roles = getInitialDatabase().roles;
      }
      if (!data.permissions) {
        data.permissions = getInitialDatabase().permissions;
      }
      
      // Migration: Add roleId to users if missing
      if (data.users && data.users.length > 0) {
        data.users = data.users.map(user => {
          if (!user.roleId && user.role) {
            // Migrate old role to roleId
            return { ...user, roleId: user.role };
          }
          return user;
        });
      }

      // Migration: Add demo users for new default roles (manager, kitchen, waiter) if missing
      const existingRoleIds = new Set(data.users.map(u => u.roleId));
      const demoUsersToAdd = getInitialDatabase().users.filter(
        u => !existingRoleIds.has(u.roleId)
      );
      if (demoUsersToAdd.length > 0) {
        data.users = [...data.users, ...demoUsersToAdd];
      }
      
      if (!data.promotions) {
        data.promotions = getInitialDatabase().promotions;
      }
      if (!data.tenantConfig) {
        data.tenantConfig = getInitialDatabase().tenantConfig;
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
