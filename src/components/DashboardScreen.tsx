import React, { useState } from 'react';
import { DASHBOARD_DATA, formatIDR } from '../data/initialData';
import { TrendingUp, Award, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

interface DashboardScreenProps {
  tenantName: string;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ tenantName }) => {
  const [period, setPeriod] = useState<'today' | '7d' | '30d'>('today');
  const [topView, setTopView] = useState<'revenue' | 'qty'>('revenue');

  const dash = DASHBOARD_DATA[period];
  const maxBar = Math.max(...dash.chart.map((b: any) => b.value));
  const chartBars = dash.chart.map((b: any) => ({
    label: b.label,
    value: b.value,
    heightPct: Math.max(4, Math.round((b.value / maxBar) * 100))
  }));

  const topItemsRaw = topView === 'revenue' ? dash.topItemsByRevenue : dash.topItemsByQty;
  const maxTop = Math.max(...topItemsRaw.map((t: any) => topView === 'revenue' ? t.revenue : t.qty));
  const topItems = topItemsRaw.map((t: any, i: number) => ({
    rank: i + 1,
    name: t.name,
    barPct: Math.max(4, Math.round(((topView === 'revenue' ? t.revenue : t.qty) / maxTop) * 100)),
    valueLabel: topView === 'revenue' ? formatIDR(t.revenue) : `${t.qty} sold`
  }));

  const deltaBadge = (v: number) => {
    const up = v >= 0;
    return {
      label: `${up ? '+' : ''}${v.toFixed(1)}%`,
      bg: up ? '#E7EFE4' : '#F6E3DE',
      color: up ? '#4C7A4A' : '#9C2B2B'
    };
  };

  const revB = deltaBadge(dash.kpis.revenueDelta);
  const ordB = deltaBadge(dash.kpis.ordersDelta);
  const avgB = deltaBadge(dash.kpis.avgTicketDelta);

  const periodStyles = (p: string) => ({
    padding: '7px 14px',
    borderRadius: '6px',
    border: 'none',
    fontSize: '12.5px',
    fontWeight: 600,
    cursor: 'pointer' as const,
    backgroundColor: period === p ? '#C1522A' : 'transparent',
    color: period === p ? '#fff' : '#7A7062'
  });

  const topStyles = (v: string) => ({
    padding: '4px 8px',
    borderRadius: '4px',
    border: 'none',
    fontSize: '11px',
    fontWeight: 600,
    cursor: 'pointer' as const,
    backgroundColor: topView === v ? '#241F18' : 'transparent',
    color: topView === v ? '#fff' : '#7A7062'
  });

  return (
    <div style={{ padding: '32px 36px', maxWidth: '1180px', width: '100%' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '22px', fontWeight: 700, margin: '0 0 4px' }}>Dashboard</h1>
          <div style={{ fontSize: '13px', color: '#7A7062' }}>Sales overview for {tenantName}</div>
        </div>
        <div style={{ display: 'flex', gap: '6px', backgroundColor: '#FBF8F3', border: '1px solid #E6DFD3', borderRadius: '8px', padding: '4px' }}>
          <button onClick={() => setPeriod('today')} style={periodStyles('today')}>Today</button>
          <button onClick={() => setPeriod('7d')} style={periodStyles('7d')}>7 Days</button>
          <button onClick={() => setPeriod('30d')} style={periodStyles('30d')}>30 Days</button>
        </div>
      </div>

      <div className="responsive-grid-3" style={{ marginBottom: '20px' }}>
        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12.5px', color: '#7A7062', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <DollarSign size={15} color="#C1522A" />
              Revenue
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: revB.bg, color: revB.color }}>
              {revB.label}
            </span>
          </div>
          <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600 }}>
            {formatIDR(dash.kpis.revenue)}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12.5px', color: '#7A7062', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShoppingBag size={15} color="#C1522A" />
              Orders
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: ordB.bg, color: ordB.color }}>
              {ordB.label}
            </span>
          </div>
          <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600 }}>
            {dash.kpis.orders}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '10px', padding: '20px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <span style={{ fontSize: '12.5px', color: '#7A7062', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={15} color="#C1522A" />
              Avg Ticket
            </span>
            <span style={{ fontSize: '11.5px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px', backgroundColor: avgB.bg, color: avgB.color }}>
              {avgB.label}
            </span>
          </div>
          <div className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 600 }}>
            {formatIDR(dash.kpis.avgTicket)}
          </div>
        </div>
      </div>

      <div className="responsive-grid-2">
        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '10px', padding: '22px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ fontSize: '13.5px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Calendar size={16} />
            Revenue trend
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '14px', height: '170px' }}>
            {chartBars.map((bar: any, idx: number) => (
              <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end', gap: '8px' }}>
                <div
                  title={`${bar.label}: ${formatIDR(bar.value)}`}
                  style={{
                    width: '100%',
                    maxWidth: '40px',
                    borderRadius: '4px 4px 0 0',
                    backgroundColor: '#C1522A',
                    height: `${bar.heightPct}%`,
                    minHeight: '4px',
                    transition: 'height 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                <span style={{ fontSize: '11px', color: '#A79C8A', fontWeight: 500 }}>{bar.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ backgroundColor: '#fff', border: '1px solid #E6DFD3', borderRadius: '10px', padding: '22px', boxShadow: '0 1px 3px rgba(36,31,24,0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <span style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} />
              Top items
            </span>
            <div style={{ display: 'flex', gap: '4px', backgroundColor: '#FBF8F3', border: '1px solid #E6DFD3', borderRadius: '6px', padding: '3px' }}>
              <button onClick={() => setTopView('revenue')} style={topStyles('revenue')}>Rev</button>
              <button onClick={() => setTopView('qty')} style={topStyles('qty')}>Qty</button>
            </div>
          </div>

          {topItems.map((it: any) => (
            <div key={it.rank} style={{ marginBottom: '13px' }}>
              <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: '5px' }}>
                <span style={{ fontSize: '12.5px', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                  {it.rank}. {it.name}
                </span>
                <span className="tnum" style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', color: '#7A7062', flexShrink: 0 }}>
                  {it.valueLabel}
                </span>
              </div>
              <div style={{ height: '5px', backgroundColor: '#F3E3D8', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ height: '100%', backgroundColor: '#C1522A', width: `${it.barPct}%`, transition: 'width 0.3s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
