'use client';

import React, { useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Typography, Button, Chip, Paper, Divider,
  Snackbar, Alert, CircularProgress, Tooltip, Badge, Stack, alpha, useTheme,
  Card,
} from '@mui/material';
import {
  EventSeat as SeatIcon, ShoppingCart as CartIcon,
  Lock as LockIcon, CheckCircle as SoldIcon, Delete as ClearIcon, InfoOutlined,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import { useSeatStore, SeatData, SeatStatus } from '@/store/seat-store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const STATUS_CONFIG = (theme: any) => ({
  AVAILABLE: { bg: alpha(theme.palette.primary.main, 0.1), border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`, color: theme.palette.primary.main, cursor: 'pointer' },
  SELECTED: { bg: theme.palette.primary.main, border: `1px solid ${theme.palette.primary.main}`, color: '#0b0f19', cursor: 'pointer' },
  LOCKED: { bg: alpha('#94a3b8', 0.1), border: '1px solid rgba(255,255,255,0.05)', color: '#64748b', cursor: 'not-allowed' },
  MY_LOCK: { bg: theme.palette.secondary.main, border: `1px solid ${theme.palette.secondary.main}`, color: '#fff', cursor: 'pointer' },
  SOLD: { bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', cursor: 'not-allowed' },
});

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const WS = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/seats';

export default function SeatMap({ eventId }: { eventId: number }) {
  const theme = useTheme();
  const socketRef = useRef<Socket | null>(null);
  const {
    seats, setSeats, updateSeats, selectedIds, toggleSeat,
    clearSelection, loading, setLoading, error, setError, currentUserId, setCurrentUserId,
  } = useSeatStore();

  const { data: session } = useSession();
  const statusStyles = STATUS_CONFIG(theme);

  useEffect(() => {
    if (session?.user?.id) {
      setCurrentUserId(Number(session.user.id));
    } else {
      setCurrentUserId(null);
    }
  }, [session, setCurrentUserId]);

  const fetchSeats = useCallback(async () => {
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
  }, [eventId]); // eslint-disable-line react-hooks/exhaustive-deps

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

  const router = useRouter();

  const doPost = async (url: string, seatIds: number[], redirectUrl?: string) => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in to book seats.');
      return;
    }

    setLoading(true);
    try {
      const r = await fetch(`${API}${url}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ eventId, seatIds }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message ?? 'Request failed'); }
      clearSelection();
      if (redirectUrl) router.push(redirectUrl);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLock = () => doPost('/api/booking/lock', Array.from(selectedIds), `/checkout?eventId=${eventId}`);

  const style = (s: SeatData) => {
    if (selectedIds.has(s.id)) return statusStyles.SELECTED;
    if (s.status === 'LOCKED' && s.lockedById === currentUserId) return statusStyles.MY_LOCK;
    return statusStyles[s.status];
  };

  const canClick = (s: SeatData) => s.status === 'AVAILABLE' || selectedIds.has(s.id);
  const myLocked = seats.filter(s => s.status === 'LOCKED' && s.lockedById === currentUserId).length;

  if (loading && !seats.length) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}>
        <CircularProgress size={48} thickness={5} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', py: 6 }}>
      {/* Legend & Info */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} sx={{ mb: 6 }} alignItems={{ md: 'center' }} justifyContent="space-between">
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, fontFamily: '"Outfit", sans-serif', mb: 1 }}>
            Select Seats
          </Typography>
          <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
            {([['AVAILABLE', 'Available'], ['SELECTED', 'Selected'], ['LOCKED', 'Occupied'], ['SOLD', 'Sold']] as const).map(([k, l]) => (
              <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 14, height: 14, borderRadius: '3px',
                  backgroundColor: statusStyles[k].bg,
                  border: statusStyles[k].border
                }} />
                <Typography variant="caption" fontWeight={600} color="text.secondary">{l}</Typography>
              </Box>
            ))}
          </Box>
        </Box>

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

      {/* Stage */}
      <Box sx={{ mb: 8, textAlign: 'center', position: 'relative' }}>
        <Box sx={{
          height: '12px', width: '60%', mx: 'auto',
          background: `linear-gradient(90deg, transparent, ${theme.palette.primary.main}, transparent)`,
          borderRadius: '50%', filter: 'blur(4px)', opacity: 0.5, mb: 1
        }} />
        <Typography variant="overline" sx={{ letterSpacing: '12px', color: 'text.secondary', fontWeight: 800 }}>STAGE</Typography>
      </Box>

      {/* Seating Zones */}
      {Array.from(zoneMap.entries()).map(([zid, { zoneName, price, rows }]) => (
        <Card key={zid} sx={{ mb: 6, p: 0, overflow: 'hidden' }}>
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

          <Box sx={{ p: 4, overflowX: 'auto' }}>
            <Stack spacing={2}>
              {Array.from(rows.entries()).map(([rn, rs]) => (
                <Stack key={rn} direction="row" spacing={2} alignItems="center">
                  <Typography sx={{ width: 40, fontWeight: 800, color: 'text.secondary', fontSize: '0.8rem', textAlign: 'center' }}>{rn}</Typography>
                  <Stack direction="row" spacing={1} sx={{ flex: 1, justifyContent: 'center' }}>
                    {rs.map(seat => {
                      const st = style(seat); const cl = canClick(seat);
                      return (
                        <Tooltip key={seat.id} title={`Row ${seat.rowName} • Seat ${seat.seatNumber} — ${seat.status}`} arrow>
                          <Box
                            onClick={() => cl && toggleSeat(seat.id)}
                            sx={{
                              width: { xs: 28, sm: 34 },
                              height: { xs: 32, sm: 38 },
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              borderRadius: '8px 8px 4px 4px',
                              fontSize: 11, fontWeight: 800, userSelect: 'none',
                              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              backgroundColor: st.bg, border: st.border, color: st.color, cursor: st.cursor,
                              '&:hover': cl ? {
                                transform: 'scale(1.2) translateY(-4px)',
                                boxShadow: `0 8px 15px ${alpha(theme.palette.primary.main, 0.3)}`,
                                zIndex: 10
                              } : {},
                              ...(selectedIds.has(seat.id) && {
                                boxShadow: `0 0 20px ${alpha(theme.palette.primary.main, 0.5)}`,
                                animation: 'pulse 1.5s infinite'
                              })
                            }}
                          >
                            {seat.seatNumber}
                          </Box>
                        </Tooltip>
                      );
                    })}
                  </Stack>
                  <Typography sx={{ width: 40, fontWeight: 800, color: 'text.secondary', fontSize: '0.8rem', textAlign: 'center' }}>{rn}</Typography>
                </Stack>
              ))}
            </Stack>
          </Box>
        </Card>
      ))}

      {/* Floating Action Bar */}
      {(selectedIds.size > 0 || myLocked > 0) && (
        <Paper
          elevation={24}
          sx={{
            position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: 600, p: 2.5, borderRadius: 6,
            background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }}
        >
          <Stack direction="row" spacing={3} alignItems="center">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Badge badgeContent={selectedIds.size} color="primary">
                <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
                  <CartIcon sx={{ fontSize: 20 }} />
                </Box>
              </Badge>
              <Box>
                <Typography variant="body2" fontWeight={800} sx={{ color: 'white' }}>
                  {selectedIds.size} Seats
                </Typography>
                <Typography variant="caption" color="text.secondary">Selected</Typography>
              </Box>
            </Box>

            {selectedIds.size > 0 && (
              <Button size="small" onClick={clearSelection} sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 800 }}>
                CLEAR
              </Button>
            )}
          </Stack>

          <Button
            variant="contained"
            disabled={!selectedIds.size || loading}
            onClick={handleLock}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <LockIcon />}
            sx={{ px: 4, py: 1.5, borderRadius: 4, fontSize: '0.9rem' }}
          >
            Lock & Continue
          </Button>
        </Paper>
      )}

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
