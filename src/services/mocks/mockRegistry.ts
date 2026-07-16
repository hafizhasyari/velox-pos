import { MockDatabase, type UserAccount, type OrderRecord } from './mockDatabase';
import { API_CONFIG } from '../apiConfig';
import type { Category, MenuItem, ShiftRecord } from '../../types/pos';

export interface HttpResponse<T = unknown> {
  status: number;
  data: T;
  error?: string;
}

// Global flag to simulate network error in Dev/E2E inspector
export let simulatedNetworkError = false;
export function setSimulatedNetworkError(val: boolean) {
  simulatedNetworkError = val;
}

async function delay(ms: number = API_CONFIG.simulatedLatencyMs): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const MockRegistry = {
  async handleRequest(method: string, endpoint: string, body?: any): Promise<HttpResponse<any>> {
    await delay();

    if (simulatedNetworkError) {
      throw new Error('500 Internal Microservice Gateway Error (Simulated by E2E DevMode)');
    }

    const db = MockDatabase.get();

    // ==========================================
    // 1. Auth & Identity Service (/auth)
    // ==========================================
    if (endpoint.startsWith('/auth/login') && method === 'POST') {
      const { role } = body || {};
      const user = db.users.find((u) => u.role === role) || db.users[0];
      return {
        status: 200,
        data: {
          token: `jwt_mock_${user.role}_${Date.now()}`,
          user,
          tenantName: db.tenantName
        }
      };
    }

    if (endpoint.startsWith('/auth/signup') && method === 'POST') {
      const { businessName, ownerName, email } = body || {};
      const newTenantName = businessName || 'Warung Baru';
      db.tenantName = newTenantName;
      const newUser: UserAccount = {
        id: 'u_' + Date.now(),
        email: email || 'owner@warungbaru.id',
        name: ownerName || 'Owner Baru',
        role: 'owner',
        tenantId: 't_' + Date.now()
      };
      db.users.push(newUser);
      MockDatabase.save(db);
      return {
        status: 201,
        data: {
          token: `jwt_mock_owner_${Date.now()}`,
          user: newUser,
          tenantName: newTenantName
        }
      };
    }

    // ==========================================
    // 2. Catalog Service (/catalog)
    // ==========================================
    if (endpoint === '/catalog' && method === 'GET') {
      return { status: 200, data: db.categories };
    }

    if (endpoint === '/catalog/categories' && method === 'POST') {
      const { name } = body || {};
      const newCat: Category = {
        id: 'c_' + Date.now(),
        name: name || 'New Category',
        items: []
      };
      db.categories.push(newCat);
      MockDatabase.save(db);
      return { status: 201, data: newCat };
    }

    if (endpoint === '/catalog/items' && method === 'POST') {
      const item: MenuItem = body;
      let savedItem = item;
      if (item.id) {
        db.categories = db.categories.map((c) => ({
          ...c,
          items: c.items.map((i) => (i.id === item.id ? item : i))
        }));
      } else {
        savedItem = { ...item, id: 'i_' + Date.now() };
        db.categories = db.categories.map((c) => {
          if (c.id === (item.categoryId || db.categories[0]?.id)) {
            return { ...c, items: [...c.items, savedItem] };
          }
          return c;
        });
      }
      MockDatabase.save(db);
      return { status: item.id ? 200 : 201, data: savedItem };
    }

    if (endpoint.startsWith('/catalog/items/') && endpoint.endsWith('/toggle-archive') && method === 'PATCH') {
      const itemId = endpoint.split('/')[3];
      let updatedItem: MenuItem | null = null;
      db.categories = db.categories.map((c) => ({
        ...c,
        items: c.items.map((i) => {
          if (i.id === itemId) {
            updatedItem = { ...i, active: !i.active };
            return updatedItem;
          }
          return i;
        })
      }));
      MockDatabase.save(db);
      return { status: 200, data: updatedItem };
    }

    // ==========================================
    // 3. Order & Table Service (/orders)
    // ==========================================
    if (endpoint === '/orders/tables' && method === 'GET') {
      return { status: 200, data: db.tables };
    }

    if (endpoint.startsWith('/orders/tables/') && endpoint.endsWith('/lock') && method === 'POST') {
      const tableNum = Number(endpoint.split('/')[3]);
      const table = db.tables.find((t) => t.number === tableNum);
      return { status: 200, data: table || null };
    }

    // ==========================================
    // 4. Payment Service (/payments)
    // ==========================================
    if (endpoint === '/payments/charge' && method === 'POST') {
      const { items, orderType, tableNumber, discountValue, discountType, paymentMethod, cashTendered } = body;
      
      const subtotal = items.reduce((acc: number, l: any) => acc + (l.basePrice + l.modTotal) * l.qty, 0);
      const disc = discountType === 'pct' ? Math.round((subtotal * discountValue) / 100) : discountValue;
      const tax = Math.round(Math.max(0, subtotal - disc) * 0.1);
      const total = Math.max(0, subtotal - disc) + tax;

      if (paymentMethod === 'cash' && cashTendered < total) {
        return {
          status: 400,
          error: `Insufficient cash tendered (Rp${cashTendered.toLocaleString()}) for total Rp${total.toLocaleString()}`,
          data: null
        };
      }

      const ticketNo = `ORD-${1000 + db.orders.length + 42}`;
      const change = paymentMethod === 'cash' ? (cashTendered - total) : 0;

      const newOrder: OrderRecord = {
        id: 'o_' + Date.now(),
        ticketNo,
        type: orderType,
        tableNumber: orderType === 'dinein' ? tableNumber : null,
        items: items.map((i: any) => ({ name: i.name, qty: i.qty, price: i.basePrice + i.modTotal, modNames: i.modNames || [] })),
        subtotal,
        discount: disc,
        tax,
        total,
        paymentMethod,
        cashTendered,
        change,
        createdAt: new Date().toISOString(),
        kdsStatus: 'new'
      };

      db.orders.unshift(newOrder);

      // Update table occupancy if dine-in
      if (orderType === 'dinein' && tableNumber) {
        db.tables = db.tables.map((t) => (t.number === tableNumber ? { ...t, status: 'occupied' } : t));
      }

      // Reconcile into current shift
      if (db.currentShift.open) {
        db.currentShift.expectedCash += total;
        db.currentShift.ordersCount += 1;
      }

      MockDatabase.save(db);
      return { status: 201, data: { order: newOrder, currentShift: db.currentShift } };
    }

    // ==========================================
    // 5. Shift & Cashier Service (/shifts)
    // ==========================================
    if (endpoint === '/shifts/current' && method === 'GET') {
      return { status: 200, data: { currentShift: db.currentShift, history: db.shiftHistory } };
    }

    if (endpoint === '/shifts/open' && method === 'POST') {
      const { openingCash } = body;
      db.currentShift = {
        open: true,
        openingCash: Number(openingCash) || 0,
        expectedCash: Number(openingCash) || 0,
        ordersCount: 0,
        openedAt: new Date().toISOString()
      };
      MockDatabase.save(db);
      return { status: 200, data: db.currentShift };
    }

    if (endpoint === '/shifts/close' && method === 'POST') {
      const { countedCash, variance } = body;
      const newRecord: ShiftRecord = {
        id: 'sh_' + Date.now(),
        date: 'Today (' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ')',
        opening: db.currentShift.openingCash,
        expected: db.currentShift.expectedCash,
        counted: Number(countedCash) || 0,
        variance: Number(variance) || 0,
        orders: db.currentShift.ordersCount
      };
      db.shiftHistory.unshift(newRecord);
      db.currentShift.open = false;
      MockDatabase.save(db);
      return { status: 200, data: { closedRecord: newRecord, history: db.shiftHistory } };
    }

    // ==========================================
    // 6. Analytics & Reporting Service (/analytics)
    // ==========================================
    if (endpoint.startsWith('/analytics/kpis') && method === 'GET') {
      const totalOrdersRevenue = db.orders.reduce((acc, o) => acc + o.total, 0);
      return {
        status: 200,
        data: {
          period: endpoint.split('?period=')[1] || 'today',
          totalRevenue: 4250000 + totalOrdersRevenue,
          totalOrders: 142 + db.orders.length,
          avgTicket: Math.round((4250000 + totalOrdersRevenue) / (142 + db.orders.length)),
          recentOrders: db.orders
        }
      };
    }

    // ==========================================
    // 7. Kitchen Display System Service (/kitchen)
    // ==========================================
    if (endpoint === '/kitchen/tickets' && method === 'GET') {
      const tickets = db.orders
        .filter(o => o.kdsStatus !== 'served')
        .map(o => ({
          id: o.id,
          ticketNo: o.ticketNo,
          type: o.type,
          tableNumber: o.tableNumber,
          status: o.kdsStatus || 'new',
          lines: o.items.map(i => ({ name: i.name, qty: i.qty, modNames: i.modNames })),
          createdAt: o.createdAt
        }));
      return { status: 200, data: tickets };
    }

    if (endpoint === '/kitchen/status' && method === 'PATCH') {
      const { orderId, status } = body;
      db.orders = db.orders.map(o => (o.id === orderId ? { ...o, kdsStatus: status } : o));
      MockDatabase.save(db);
      
      const tickets = db.orders
        .filter(o => o.kdsStatus !== 'served')
        .map(o => ({
          id: o.id,
          ticketNo: o.ticketNo,
          type: o.type,
          tableNumber: o.tableNumber,
          status: o.kdsStatus || 'new',
          lines: o.items.map(i => ({ name: i.name, qty: i.qty, modNames: i.modNames })),
          createdAt: o.createdAt
        }));
      return { status: 200, data: tickets };
    }

    // ==========================================
    // 8. Promotion & Voucher Service (/promotions)
    // ==========================================
    if (endpoint === '/promotions/list' && method === 'GET') {
      return { status: 200, data: db.promotions };
    }

    if (endpoint === '/promotions/validate' && method === 'POST') {
      const { code, subtotal } = body;
      const found = db.promotions.find(p => p.code.toUpperCase() === code.trim().toUpperCase() && p.active);
      if (!found) {
        return { status: 400, error: `Voucher code "${code}" not found or inactive`, data: null };
      }
      if (subtotal < found.minSpend) {
        return { status: 400, error: `Minimum spend Rp${found.minSpend.toLocaleString()} required for ${found.code}`, data: null };
      }
      return { status: 200, data: found };
    }

    if (endpoint === '/promotions/save' && method === 'POST') {
      const promo: any = body;
      const idx = db.promotions.findIndex(p => p.code.toUpperCase() === promo.code.toUpperCase());
      if (idx >= 0) {
        db.promotions[idx] = { ...promo, code: promo.code.toUpperCase() };
      } else {
        db.promotions.push({ ...promo, code: promo.code.toUpperCase() });
      }
      MockDatabase.save(db);
      return { status: 200, data: db.promotions };
    }

    if (endpoint === '/promotions/toggle' && method === 'POST') {
      const { code } = body;
      const idx = db.promotions.findIndex(p => p.code.toUpperCase() === code.toUpperCase());
      if (idx >= 0) {
        db.promotions[idx].active = !db.promotions[idx].active;
        MockDatabase.save(db);
      }
      return { status: 200, data: db.promotions };
    }

    if (endpoint === '/promotions/delete' && method === 'DELETE') {
      const { code } = body;
      db.promotions = db.promotions.filter(p => p.code.toUpperCase() !== code.toUpperCase());
      MockDatabase.save(db);
      return { status: 200, data: db.promotions };
    }

    return { status: 404, error: `Microservice endpoint ${method} ${endpoint} not found in MockRegistry`, data: null };
  }
};
