import React from 'react';
import type { KitchenTicket, KitchenTicketStatus } from '../types/pos';
import { ChefHat, Clock, CheckCircle2, Flame, UtensilsCrossed, AlertTriangle } from 'lucide-react';

interface KdsScreenProps {
  tickets: KitchenTicket[];
  onUpdateStatus: (orderId: string, status: KitchenTicketStatus) => void;
}

export const KdsScreen: React.FC<KdsScreenProps> = ({ tickets, onUpdateStatus }) => {
  const newTickets = tickets.filter(t => t.status === 'new');
  const cookingTickets = tickets.filter(t => t.status === 'cooking');
  const readyTickets = tickets.filter(t => t.status === 'ready');

  const getElapsedMinutes = (createdAt: string) => {
    try {
      const created = new Date(createdAt).getTime();
      const now = Date.now();
      const diffMinutes = Math.floor((now - created) / 60000);
      return Math.max(0, diffMinutes);
    } catch {
      return 0;
    }
  };

  const renderTicketCard = (ticket: KitchenTicket) => {
    const elapsed = getElapsedMinutes(ticket.createdAt);
    const isUrgent = elapsed >= 15 && ticket.status !== 'ready';

    let statusBoxBg = 'rgba(37, 99, 235, 0.15)'; // Blue tint for new
    let statusBorder = '1px solid rgba(37, 99, 235, 0.4)';
    let statusColor = '#93C5FD'; // blue-300 for >7:1 WCAG AA contrast
    let statusDot = '#3B82F6';
    let badgeLabel = 'NEW ORDER';

    if (ticket.status === 'cooking') {
      statusBoxBg = 'rgba(245, 158, 11, 0.15)'; // Orange tint for cooking
      statusBorder = '1px solid rgba(245, 158, 11, 0.4)';
      statusColor = '#FDE047'; // yellow-300 for >9:1 WCAG AA contrast
      statusDot = '#F59E0B';
      badgeLabel = 'COOKING IN PROGRESS';
    } else if (ticket.status === 'ready') {
      statusBoxBg = 'rgba(16, 185, 129, 0.15)'; // Green tint for ready
      statusBorder = '1px solid rgba(16, 185, 129, 0.4)';
      statusColor = '#6EE7B7'; // emerald-300 for >8:1 WCAG AA contrast
      statusDot = '#10B981';
      badgeLabel = 'READY TO SERVE';
    }

    return (
      <div
        key={ticket.id}
        data-testid={`kds-card-${ticket.ticketNo}`}
        style={{
          backgroundColor: '#2D271F',
          borderRadius: '12px',
          border: isUrgent ? '2px solid #EF4444' : '1px solid #4A4033',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          color: '#F6F2EC',
          boxShadow: isUrgent ? '0 0 16px rgba(239, 68, 68, 0.25), 0 6px 16px rgba(0,0,0,0.25)' : '0 6px 16px rgba(0,0,0,0.25)',
          position: 'relative'
        }}
      >
        <div>
          {/* High-Precision Header Container */}
          <div style={{ marginBottom: '14px', paddingBottom: '12px', borderBottom: '1px solid #4A4033' }}>
            {/* Row 1: Ticket No + Order Type (Left) vs Precision Timer Pill (Right) */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '20px', fontWeight: 800, color: '#F6F2EC', letterSpacing: '-0.02em', lineHeight: 1 }}>
                  {ticket.ticketNo}
                </span>
                <span style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  padding: '3.5px 8.5px',
                  borderRadius: '6px',
                  backgroundColor: '#3E362A',
                  color: '#D4CAB8',
                  lineHeight: 1
                }}>
                  {ticket.type === 'dinein'
                    ? `Dine-in • Meja ${ticket.tableNumber ? (ticket.tableNumber < 10 ? '0' + ticket.tableNumber : ticket.tableNumber) : '-'}`
                    : 'Takeaway / Bungkus'}
                </span>
              </div>

              {/* Precision Elapsed Time Pill */}
              <div
                data-testid={`timer-pill-${ticket.ticketNo}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '4.5px 9px',
                  borderRadius: '6px',
                  backgroundColor: isUrgent ? '#7F1D1D' : '#3E362A',
                  color: isUrgent ? '#FCA5A5' : '#D4CAB8',
                  border: isUrgent ? '1px solid #EF4444' : '1px solid #5C503D',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                  lineHeight: 1
                }}
              >
                {isUrgent ? <AlertTriangle size={13} color="#EF4444" /> : <Clock size={13} />}
                <span>{elapsed}m ago</span>
              </div>
            </div>

            {/* Row 2: Dedicated Full-Width Status Banner Pill */}
            <div
              data-testid={`status-banner-${ticket.ticketNo}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 11px',
                borderRadius: '8px',
                backgroundColor: statusBoxBg,
                border: statusBorder,
                color: statusColor,
                marginTop: '11px',
                fontSize: '12.5px',
                fontWeight: 700,
                letterSpacing: '0.02em'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: statusDot, boxShadow: `0 0 6px ${statusDot}` }} />
                <span>{badgeLabel}</span>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 700 }}>
                {ticket.lines.length} {ticket.lines.length === 1 ? 'Item' : 'Items'}
              </span>
            </div>
          </div>

          {/* Lines */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {ticket.lines.map((l, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', fontSize: '14.5px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#F6F2EC' }}>
                    <span style={{ color: '#E07A5F', marginRight: '6px', fontWeight: 700 }}>{l.qty}x</span>
                    {l.name}
                  </div>
                  {l.modNames && l.modNames.length > 0 && (
                    <div style={{ fontSize: '12.5px', color: '#B5A898', marginTop: '2px', paddingLeft: '22px' }}>
                      {l.modNames.map((m, mIdx) => (
                        <div key={mIdx} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>•</span>
                          <span>{m}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div style={{ marginTop: 'auto', paddingTop: '10px' }}>
          {ticket.status === 'new' && (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'cooking')}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#F59E0B',
                color: '#241F18',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 10px rgba(245, 158, 11, 0.3)'
              }}
            >
              <Flame size={16} /> Start Cooking
            </button>
          )}

          {ticket.status === 'cooking' && (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'ready')}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#10B981',
                color: '#fff',
                fontSize: '13.5px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 10px rgba(16, 185, 129, 0.3)'
              }}
            >
              <CheckCircle2 size={16} /> Mark Ready
            </button>
          )}

          {ticket.status === 'ready' && (
            <button
              onClick={() => onUpdateStatus(ticket.id, 'served')}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                border: '1px solid #4A4033',
                backgroundColor: '#3E362A',
                color: '#F6F2EC',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <UtensilsCrossed size={16} /> Complete / Serve
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      padding: '32px 36px',
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#241F18',
      color: '#F6F2EC',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* KDS Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '16px', marginBottom: '28px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '10px',
            backgroundColor: 'var(--color-velvet)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff'
          }}>
            <ChefHat size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 4px', color: '#F6F2EC' }}>
              Kitchen Display System (KDS)
            </h1>
            <div style={{ fontSize: '13.5px', color: '#A89E8E' }}>
              Real-time ticket queue, modifier notes, and preparation tracking
            </div>
          </div>
        </div>

        {/* Counter Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#2D271F', border: '1px solid #2563EB', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#2563EB' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#A89E8E' }}>New:</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#2563EB' }}>{newTickets.length}</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#2D271F', border: '1px solid #F59E0B', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#A89E8E' }}>Cooking:</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#F59E0B' }}>{cookingTickets.length}</span>
          </div>
          <div style={{ padding: '8px 16px', borderRadius: '8px', backgroundColor: '#2D271F', border: '1px solid #10B981', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#A89E8E' }}>Ready:</span>
            <span style={{ fontSize: '15px', fontWeight: 700, color: '#10B981' }}>{readyTickets.length}</span>
          </div>
        </div>
      </div>

      {/* Ticket Grid */}
      {tickets.length === 0 ? (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-muted)',
          padding: '48px'
        }}>
          <ChefHat size={48} style={{ opacity: 0.3, marginBottom: '16px' }} />
          <div style={{ fontSize: '16px', fontWeight: 600 }}>No active kitchen orders</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>New tickets submitted from the POS will automatically appear here.</div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))',
          gap: '20px',
          alignItems: 'start'
        }}>
          {tickets.map(t => renderTicketCard(t))}
        </div>
      )}
    </div>
  );
};
