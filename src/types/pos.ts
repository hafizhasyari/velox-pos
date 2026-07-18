export interface ModifierOption {
  id: string;
  name: string;
  priceDelta: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  required: boolean;
  multi: boolean;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  active: boolean;
  modifierGroups: ModifierGroup[];
  categoryId?: string;
}

export interface Category {
  id: string;
  name: string;
  items: MenuItem[];
}

export interface TableItem {
  id: string;
  number: number;
  status: 'free' | 'occupied';
  seats: number;
}

export interface CartLine {
  id: string;
  itemId: string;
  name: string;
  basePrice: number;
  modNames: string[];
  modKey: string;
  modTotal: number;
  qty: number;
}

export interface OrderTotals {
  subtotal: number;
  discountAmount: number;
  tax: number;
  total: number;
}

export interface Order {
  id: string;
  time: Date;
  orderType: 'dinein' | 'takeaway';
  tableNumber: number | null;
  lines: CartLine[];
  totals: OrderTotals;
  paymentMethod: 'cash' | 'qris';
  cashTendered: number;
}

export interface ShiftRecord {
  id: string;
  date: string;
  opening: number;
  expected: number;
  counted: number;
  variance: number;
  orders: number;
}

export type KitchenTicketStatus = 'new' | 'cooking' | 'ready' | 'served';

export interface KitchenTicketLine {
  name: string;
  qty: number;
  modNames: string[];
}

export interface KitchenTicket {
  id: string; // Order ID e.g. o_101
  ticketNo: string; // e.g. ORD-1042
  type: 'dinein' | 'takeaway';
  tableNumber: number | null;
  status: KitchenTicketStatus;
  lines: KitchenTicketLine[];
  createdAt: string;
}

export interface VoucherPromo {
  code: string;
  label: string;
  discountType: 'pct' | 'rp';
  discountValue: number;
  minSpend: number;
  active: boolean;
}

export interface TenantConfig {
  taxRate: number;     // decimal, e.g. 0.11 for 11%, 0 for disabled
  taxEnabled: boolean;
  taxLabel: string;    // display label, e.g. "PPN 11%"
}

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role?: 'owner' | 'kasir';  // Deprecated - for backward compatibility
  roleId: string;             // Primary role identifier
  tenantId: string;
}

export type ScreenType = 'login' | 'signup' | 'dashboard' | 'menu' | 'promotions' | 'pos' | 'shift' | 'kds' | 'settings';
export type RoleType = string;  // Changed from 'owner' | 'kasir' to flexible string

// Re-export RBAC types
export type { Role, Permission, CreateRoleDto, UpdateRoleDto } from './rbac';
export { MAX_ROLES_PER_TENANT } from './rbac';
