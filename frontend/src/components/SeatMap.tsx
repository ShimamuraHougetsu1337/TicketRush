'use client';

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, CircularProgress, Stack, alpha, useTheme, Card, Chip, Snackbar, Alert
} from '@mui/material';
import { InfoOutlined } from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import { useSeatStore, SeatData } from '@/store/seat-store';
import { useSession } from 'next-auth/react';

import SeatButton from './SeatMap/SeatButton';
import LockCountdown from './SeatMap/LockCountdown';
import FloatingActionBar from './SeatMap/FloatingActionBar';
import StatusLegend from './SeatMap/StatusLegend';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const WS = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/seats';

const STATUS_CONFIG = (theme: any) => ({
  AVAILABLE: {
    bg: alpha('#ffffff', 0.03),
    border: '1px solid rgba(255,255,255,0.1)',
    color: alpha('#ffffff', 0.5),
    cursor: 'pointer',
    hoverBg: alpha(theme.palette.primary.main, 0.1)
  },
  SELECTED: {
    bg: theme.palette.primary.main,
    border: `1px solid ${theme.palette.primary.main}`,
    color: '#000',
    cursor: 'pointer',
    shadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}`
  },
  LOCKED: {
    bg: alpha('#1e293b', 0.5),
    border: '1px solid rgba(255,255,255,0.03)',
    color: '#475569',
    cursor: 'not-allowed'
  },
  MY_LOCK: {
    bg: '#f59e0b',
    border: '1px solid #f59e0b',
    color: '#000',
    cursor: 'pointer',
    shadow: '0 0 15px rgba(245, 158, 11, 0.6)'
  },
  SOLD: {
    bg: alpha('#ef4444', 0.05),
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: alpha('#ef4444', 0.4),
    cursor: 'not-allowed'
  },
});

// Memoized Row component to prevent re-rendering entire map when one seat changes
const SeatRow = React.memo(({ rowName, seats, currentUserId }: { rowName: string; seats: SeatData[]; currentUserId: number | null }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '8px', marginBottom: '8px', justifyContent: 'center' }}>
      <Typography sx={{ width: 30, fontWeight: 800, color: 'text.secondary', fontSize: '0.8rem', textAlign: 'right', mr: 1 }}>
        {rowName}
      </Typography>
      <div style={{ display: 'flex', flexDirection: 'row', gap: '4px' }}>
        {seats.map(seat => (
          <SeatButton
            key={seat.id}
            seat={{
              id: seat.id,
              status: seat.status,
              seatNumber: seat.seatNumber,
              lockedById: seat.lockedById
            }}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    </div>
  );
});
SeatRow.displayName = 'SeatRow';

export default function SeatMap({ eventId }: { eventId: number }) {
  const theme = useTheme();
  const socketRef = useRef<Socket | null>(null);
  const { seats, setSeats, updateSeats, loading, setLoading, error, setError, currentUserId, setCurrentUserId } = useSeatStore();

  const { data: session } = useSession();
  const statusStyles = useMemo(() => STATUS_CONFIG(theme), [theme]);

  useEffect(() => {
    setCurrentUserId(session?.user?.id ? Number(session.user.id) : null);
  }, [session, setCurrentUserId]);

  const fetchSeats = useCallback(async () => {
    const currentSeats = useSeatStore.getState().seats;
    const isSameEvent = currentSeats.length > 0 && currentSeats[0].eventId === eventId;

    if (!isSameEvent) {
      setSeats([]);
      useSeatStore.getState().clearSelection();
    }
    
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/booking/events/${eventId}/seats`);
      if (!r.ok) throw new Error('Failed to fetch seats');
      setSeats(await r.json());
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  }, [eventId, setSeats, setLoading, setError]);

  useEffect(() => {
    fetchSeats();
    const socket = io(WS, { transports: ['websocket'] });
    socketRef.current = socket;
    socket.on('connect', () => socket.emit('joinEvent', { eventId }));
    socket.on('seatUpdate', (p: { eventId: number; seats: Partial<SeatData>[] }) => {
      if (p.eventId === eventId) updateSeats(p.seats);
    });
    return () => { socket.emit('leaveEvent', { eventId }); socket.disconnect(); };
  }, [eventId, updateSeats, fetchSeats]);

  const zoneMap = useMemo(() => {
    const m = new Map<number, { zoneName: string; price: number; rows: Map<string, SeatData[]> }>();
    for (const s of seats) {
      if (!m.has(s.zoneId)) m.set(s.zoneId, { zoneName: s.zone.name, price: s.zone.price, rows: new Map() });
      const z = m.get(s.zoneId)!;
      if (!z.rows.has(s.rowName)) z.rows.set(s.rowName, []);
      z.rows.get(s.rowName)!.push(s);
    }
    for (const z of m.values()) for (const [, rs] of z.rows) rs.sort((a, b) => a.seatNumber - b.seatNumber);
    return m;
  }, [seats]);

  const myLockedIds = useMemo(() => 
    seats.filter(s => s.status === 'LOCKED' && s.lockedById === currentUserId).map(s => s.id),
    [seats, currentUserId]
  );

  if (loading && !seats.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
        <CircularProgress size={48} thickness={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 6 }}>
      
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 6 }} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 1 }}>
            Select Seats
          </Typography>
          <StatusLegend statusStyles={statusStyles} />
        </Box>

        <Stack direction="row" spacing={2} alignItems="center">
          <LockCountdown seats={seats} currentUserId={currentUserId} />
          <Box sx={{
            display: 'flex', alignItems: 'center', gap: 1.5, p: 2,
            borderRadius: 3, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)'
          }}>
            <InfoOutlined color="primary" />
            <Typography variant="body2" color="text.secondary">
              Seats are held for <Box component="span" sx={{ color: 'white', fontWeight: 700 }}>10 minutes</Box> once locked.
            </Typography>
          </Box>
        </Stack>
      </Stack>

      <Box sx={{ mb: 8, textAlign: 'center', position: 'relative' }}>
        <Box sx={{
          height: '12px', width: '60%', mx: 'auto',
          background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
          borderRadius: '50%', filter: 'blur(4px)', opacity: 0.5, mb: 1
        }} />
        <Typography variant="overline" sx={{ letterSpacing: '12px', color: 'text.secondary', fontWeight: 800 }}>STAGE</Typography>
      </Box>

      {Array.from(zoneMap.entries()).map(([zid, { zoneName, price, rows }]) => (
        <Card key={zid} sx={{ mb: 6, p: 0, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', background: alpha(theme.palette.background.paper, 0.5) }}>
          <Box sx={{
            p: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)'
          }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>{zoneName}</Typography>
              <Chip label="Most Popular" size="small" sx={{ height: 20, fontSize: '0.65rem', fontWeight: 800, background: alpha(theme.palette.secondary.main, 0.2), color: theme.palette.secondary.main, border: 'none' }} />
            </Box>
            <Typography variant="h6" color="primary" fontWeight={800}>${price}</Typography>
          </Box>

          <Box sx={{ p: 4, overflowX: 'auto', '&::-webkit-scrollbar': { height: 6 }, '&::-webkit-scrollbar-thumb': { background: 'rgba(255,255,255,0.1)', borderRadius: 10 } }}>
            <div style={{ display: 'flex', flexDirection: 'column', minWidth: 'fit-content' }}>
              {Array.from(rows.entries()).map(([rn, rs]) => (
                <SeatRow key={rn} rowName={rn} seats={rs} currentUserId={currentUserId} />
              ))}
            </div>
          </Box>
        </Card>
      ))}

      <FloatingActionBar eventId={eventId} myLockedIds={myLockedIds} />

      <Snackbar open={!!error} autoHideDuration={5000} onClose={() => setError(null)} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" onClose={() => setError(null)} variant="filled" sx={{ width: '100%', borderRadius: 3, fontWeight: 700 }}>{error}</Alert>
      </Snackbar>

      <style jsx global>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.7; }
          100% { opacity: 1; }
        }
      `}</style>
    </Box>
  );
}
