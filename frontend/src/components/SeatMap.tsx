'use client';

import React, { useEffect, useCallback, useMemo, useRef, useState } from 'react';
import {
  Box, Typography, Button, Chip, Paper, Divider,
  Snackbar, Alert, CircularProgress, Tooltip, Badge, Stack, alpha, useTheme,
  Card,
} from '@mui/material';
import {
  EventSeat as SeatIcon, ShoppingCart as CartIcon,
  Lock as LockIcon, CheckCircle as SoldIcon, Delete as ClearIcon, InfoOutlined,
  Timer as TimerIcon,
} from '@mui/icons-material';
import { io, Socket } from 'socket.io-client';
import { useSeatStore, SeatData, SeatStatus } from '@/store/seat-store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

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
    bg: '#f59e0b', // Amber color for distinct ownership
    border: '1px solid #f59e0b', 
    color: '#000', 
    cursor: 'pointer',
    shadow: '0 0 15px rgba(245, 158, 11, 0.4)'
  },
  SOLD: { 
    bg: alpha('#ef4444', 0.05), 
    border: '1px solid rgba(239, 68, 68, 0.2)', 
    color: alpha('#ef4444', 0.4), 
    cursor: 'not-allowed' 
  },
});

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';
const WS = process.env.NEXT_PUBLIC_WS_URL ?? 'http://localhost:8080/seats';

// Countdown Sub-component
function LockCountdown({ seats, currentUserId }: { seats: SeatData[], currentUserId: number | null }) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const myLockedSeats = useMemo(() =>
    seats.filter(s => s.status === 'LOCKED' && s.lockedById === currentUserId && s.lockedAt),
    [seats, currentUserId]
  );

  useEffect(() => {
    if (myLockedSeats.length === 0) return;

    const interval = setInterval(() => {
      // Find the earliest lock time
      const lockTimes = myLockedSeats.map(s => new Date(s.lockedAt!).getTime());
      const earliestLock = Math.min(...lockTimes);
      const expiryTime = earliestLock + 10 * 60 * 1000;
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        window.location.reload(); // Refresh to release seats
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [myLockedSeats]);

  if (myLockedSeats.length === 0) return null;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
      background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
      borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.3)'
    }}>
      <TimerIcon fontSize="small" />
      <Typography variant="body2" fontWeight={800}>
        Time to checkout: {timeLeft}
      </Typography>
    </Box>
  );
}

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

  const handleLock = () => {
    if (selectedIds.size > 0) {
      // If there are new seats to lock
      doPost('/api/booking/lock', Array.from(selectedIds), `/checkout?eventId=${eventId}`);
    } else if (myLocked > 0) {
      // If only existing locked seats, just redirect
      router.push(`/checkout?eventId=${eventId}`);
    }
  };

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
            {([['AVAILABLE', 'Available'], ['SELECTED', 'Selected'], ['MY_LOCK', 'Your Seats'], ['LOCKED', 'Occupied'], ['SOLD', 'Sold']] as const).map(([k, l]) => (
              <Box key={k} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{
                  width: 14, height: 14, borderRadius: '2px',
                  backgroundColor: (statusStyles as any)[k].bg,
                  border: (statusStyles as any)[k].border,
                  boxShadow: (statusStyles as any)[k].shadow || 'none'
                }} />
                <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}>{l}</Typography>
              </Box>
            ))}
          </Box>
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
                <Stack
                  key={rn}
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="center"
                  sx={{ mb: 1 }}
                >
                  <Typography
                    sx={{
                      width: 30,
                      fontWeight: 800,
                      color: 'text.secondary',
                      fontSize: '0.8rem',
                      textAlign: 'right'
                    }}
                  >
                    {rn}
                  </Typography>

                  {/* 4. Bỏ flex: 1 và justifyContent ở đây đi */}
                  <Stack direction="row" spacing={1}>
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
                              borderRadius: '4px',
                              fontSize: 10, fontWeight: 900, userSelect: 'none',
                              transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                              backgroundColor: st.bg, 
                              border: st.border, 
                              color: st.color, 
                              cursor: st.cursor,
                              boxShadow: (st as any).shadow || 'none',
                              '&:hover': cl ? {
                                transform: 'translateY(-4px)',
                                backgroundColor: (st as any).hoverBg || st.bg,
                                borderColor: theme.palette.primary.main,
                                boxShadow: `0 8px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
                                zIndex: 10
                              } : {},
                              ...(selectedIds.has(seat.id) && {
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
            disabled={(!selectedIds.size && myLocked === 0) || loading}
            onClick={handleLock}
            startIcon={loading ? <CircularProgress size={18} color="inherit" /> : (selectedIds.size > 0 ? <LockIcon /> : <CartIcon />)}
            sx={{ px: 4, py: 1.5, borderRadius: 4, fontSize: '0.9rem' }}
          >
            {selectedIds.size > 0 ? 'Lock & Continue' : 'Continue to Checkout'}
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
