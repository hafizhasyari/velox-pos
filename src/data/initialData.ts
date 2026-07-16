import type { Category, TableItem } from '../types/pos';

export function formatIDR(n: number | string): string {
  const num = Math.round(Number(n) || 0);
  return 'Rp' + num.toLocaleString('id-ID');
}

export function buildInitialMenu(): Category[] {
  return [
    {
      id: 'c1', name: 'Nasi & Ayam', items: [
        {
          id: 'i1', name: 'Nasi Goreng Spesial', price: 28000, active: true, categoryId: 'c1', modifierGroups: [
            { id: 'g1', name: 'Level Kepedasan', required: true, multi: false, options: [
              { id: 'o1', name: 'Tidak Pedas', priceDelta: 0 }, { id: 'o2', name: 'Sedang', priceDelta: 0 }, { id: 'o3', name: 'Pedas', priceDelta: 0 }
            ]},
            { id: 'g2', name: 'Tambahan', required: false, multi: true, options: [
              { id: 'o4', name: 'Telur', priceDelta: 5000 }, { id: 'o5', name: 'Ayam Suwir', priceDelta: 8000 }
            ]}
          ]
        },
        {
          id: 'i2', name: 'Ayam Geprek', price: 25000, active: true, categoryId: 'c1', modifierGroups: [
            { id: 'g3', name: 'Level Kepedasan', required: true, multi: false, options: [
              { id: 'o6', name: 'Sedang', priceDelta: 0 }, { id: 'o7', name: 'Pedas', priceDelta: 0 }, { id: 'o8', name: 'Extra Pedas', priceDelta: 0 }
            ]}
          ]
        },
        { id: 'i3', name: 'Nasi Ayam Bakar', price: 27000, active: true, categoryId: 'c1', modifierGroups: [] },
        { id: 'i4', name: 'Nasi Rendang', price: 32000, active: true, categoryId: 'c1', modifierGroups: [] }
      ]
    },
    {
      id: 'c2', name: 'Mie & Bakmi', items: [
        { id: 'i5', name: 'Mie Goreng Jawa', price: 24000, active: true, categoryId: 'c2', modifierGroups: [] },
        { id: 'i6', name: 'Bakmi Ayam Pangsit', price: 26000, active: true, categoryId: 'c2', modifierGroups: [] },
        { id: 'i7', name: 'Indomie Special', price: 15000, active: true, categoryId: 'c2', modifierGroups: [] }
      ]
    },
    {
      id: 'c3', name: 'Minuman', items: [
        { id: 'i8', name: 'Es Teh Manis', price: 6000, active: true, categoryId: 'c3', modifierGroups: [] },
        { id: 'i9', name: 'Es Jeruk', price: 8000, active: true, categoryId: 'c3', modifierGroups: [] },
        { id: 'i10', name: 'Kopi Susu Gula Aren', price: 18000, active: true, categoryId: 'c3', modifierGroups: [] },
        { id: 'i11', name: 'Air Mineral', price: 5000, active: true, categoryId: 'c3', modifierGroups: [] },
        { id: 'i12', name: 'Es Kelapa Muda', price: 15000, active: true, categoryId: 'c3', modifierGroups: [] }
      ]
    },
    {
      id: 'c4', name: 'Snack & Gorengan', items: [
        { id: 'i13', name: 'Tahu Isi (5pcs)', price: 12000, active: true, categoryId: 'c4', modifierGroups: [] },
        { id: 'i14', name: 'Pisang Goreng', price: 10000, active: true, categoryId: 'c4', modifierGroups: [] },
        { id: 'i15', name: 'Kentang Goreng', price: 15000, active: true, categoryId: 'c4', modifierGroups: [] }
      ]
    },
    {
      id: 'c5', name: 'Dessert', items: [
        { id: 'i16', name: 'Es Krim Goreng', price: 18000, active: true, categoryId: 'c5', modifierGroups: [] },
        { id: 'i17', name: 'Puding Coklat', price: 12000, active: true, categoryId: 'c5', modifierGroups: [] }
      ]
    }
  ];
}

export function buildInitialTables(): TableItem[] {
  const statuses: ('free' | 'occupied')[] = ['free', 'free', 'occupied', 'free', 'free', 'occupied', 'free', 'free', 'free', 'occupied', 'free', 'free'];
  return statuses.map((s, i) => ({ id: 't' + (i + 1), number: i + 1, status: s, seats: (i % 3 === 0 ? 2 : 4) }));
}

export const DASHBOARD_DATA: Record<string, any> = {
  today: {
    kpis: { revenue: 1840000, revenueDelta: 8.4, orders: 62, ordersDelta: 5.1, avgTicket: 29677, avgTicketDelta: 3.1 },
    chart: [ { label: '08', value: 40000 }, { label: '10', value: 90000 }, { label: '12', value: 320000 }, { label: '14', value: 260000 }, { label: '16', value: 140000 }, { label: '18', value: 190000 }, { label: '20', value: 410000 }, { label: '22', value: 390000 } ],
    topItemsByRevenue: [ { name: 'Nasi Goreng Spesial', qty: 18, revenue: 504000 }, { name: 'Ayam Geprek', qty: 14, revenue: 350000 }, { name: 'Kopi Susu Gula Aren', qty: 16, revenue: 288000 }, { name: 'Nasi Ayam Bakar', qty: 9, revenue: 243000 }, { name: 'Mie Goreng Jawa', qty: 8, revenue: 192000 } ],
    topItemsByQty: [ { name: 'Es Teh Manis', qty: 34, revenue: 204000 }, { name: 'Nasi Goreng Spesial', qty: 18, revenue: 504000 }, { name: 'Kopi Susu Gula Aren', qty: 16, revenue: 288000 }, { name: 'Ayam Geprek', qty: 14, revenue: 350000 }, { name: 'Tahu Isi', qty: 12, revenue: 144000 } ]
  },
  '7d': {
    kpis: { revenue: 12450000, revenueDelta: 12.3, orders: 418, ordersDelta: 9.7, avgTicket: 29785, avgTicketDelta: 2.3 },
    chart: [ { label: 'Mon', value: 1520000 }, { label: 'Tue', value: 1180000 }, { label: 'Wed', value: 1340000 }, { label: 'Thu', value: 1610000 }, { label: 'Fri', value: 2040000 }, { label: 'Sat', value: 2450000 }, { label: 'Sun', value: 2310000 } ],
    topItemsByRevenue: [ { name: 'Nasi Goreng Spesial', qty: 126, revenue: 3528000 }, { name: 'Ayam Geprek', qty: 98, revenue: 2450000 }, { name: 'Kopi Susu Gula Aren', qty: 112, revenue: 2016000 }, { name: 'Nasi Ayam Bakar', qty: 63, revenue: 1701000 }, { name: 'Mie Goreng Jawa', qty: 56, revenue: 1344000 } ],
    topItemsByQty: [ { name: 'Es Teh Manis', qty: 238, revenue: 1428000 }, { name: 'Nasi Goreng Spesial', qty: 126, revenue: 3528000 }, { name: 'Kopi Susu Gula Aren', qty: 112, revenue: 2016000 }, { name: 'Ayam Geprek', qty: 98, revenue: 2450000 }, { name: 'Tahu Isi', qty: 84, revenue: 1008000 } ]
  },
  '30d': {
    kpis: { revenue: 54200000, revenueDelta: 6.7, orders: 1830, ordersDelta: 4.4, avgTicket: 29617, avgTicketDelta: 2.2 },
    chart: [ { label: 'Week 1', value: 12100000 }, { label: 'Week 2', value: 13400000 }, { label: 'Week 3', value: 14300000 }, { label: 'Week 4', value: 14400000 } ],
    topItemsByRevenue: [ { name: 'Nasi Goreng Spesial', qty: 548, revenue: 15344000 }, { name: 'Ayam Geprek', qty: 426, revenue: 10650000 }, { name: 'Kopi Susu Gula Aren', qty: 487, revenue: 8766000 }, { name: 'Nasi Ayam Bakar', qty: 274, revenue: 7398000 }, { name: 'Mie Goreng Jawa', qty: 243, revenue: 5832000 } ],
    topItemsByQty: [ { name: 'Es Teh Manis', qty: 1034, revenue: 6204000 }, { name: 'Nasi Goreng Spesial', qty: 548, revenue: 15344000 }, { name: 'Kopi Susu Gula Aren', qty: 487, revenue: 8766000 }, { name: 'Ayam Geprek', qty: 426, revenue: 10650000 }, { name: 'Tahu Isi', qty: 365, revenue: 4380000 } ]
  }
};
