'use client';

import React, { useEffect, useState, Suspense, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Box, Container, Typography, Paper, Button,
  Divider, CircularProgress, Alert, List, ListItem, ListItemText, Stack, alpha, useTheme,
  Chip,
  Grid,
} from '@mui/material';
import { Payment as PaymentIcon, Timer as TimerIcon, ConfirmationNumber, ShoppingBag, VerifiedUser as ShieldCheck } from '@mui/icons-material';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Countdown Sub-component for Checkout
function CheckoutTimer({ seats, onExpire }: { seats: any[], onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const theme = useTheme();

  useEffect(() => {
    if (seats.length === 0) return;

    const interval = setInterval(() => {
      // Find the earliest lock time among all seats in the order
      const lockTimes = seats.map(s => new Date(s.lockedAt).getTime());
      const earliestLock = Math.min(...lockTimes);
      const expiryTime = earliestLock + 10 * 60 * 1000;
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        onExpire();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seats, onExpire]);

  return (
    <Chip
      icon={<TimerIcon sx={{ fontSize: 16, color: 'inherit !important' }} />}
      label={`Ends in ${timeLeft}`}
      size="small"
      sx={{ 
        fontWeight: 900, 
        background: alpha('#ef4444', 0.1), 
        color: '#ef4444',
        px: 1,
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}
    />
  );
}

function CheckoutContent() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const eventId = searchParams.get('eventId');

  const [seats, setSeats] = useState<any[]>([]);
  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading' || !session?.user?.accessToken || !eventId) return;

    const fetchData = async () => {
      try {
        const [eventRes, seatsRes] = await Promise.all([
          fetch(`${API}/api/events/${eventId}`),
          fetch(`${API}/api/booking/events/${eventId}/seats`),
        ]);

        if (!eventRes.ok || !seatsRes.ok) throw new Error('Failed to load booking data');

        setEvent(await eventRes.json());
        const allSeats = await seatsRes.json();

        const myLockedSeats = allSeats.filter(
          (s: any) => s.status === 'LOCKED' && s.lockedById === Number(session.user.id)
        );

        setSeats(myLockedSeats);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [eventId, session, status, router]);

  const handleConfirm = async () => {
    if (!session?.user?.accessToken || seats.length === 0) return;
    setConfirming(true);
    setError(null);

    try {
      const seatIds = seats.map((s) => s.id);
      const res = await fetch(`${API}/api/booking/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({ eventId: Number(eventId), seatIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Payment failed or seats expired');
      }

      router.push('/my-tickets');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setConfirming(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 15, alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} thickness={5} />
        <Typography color="text.secondary">Finalizing your order...</Typography>
      </Box>
    );
  }

  if (seats.length === 0 || isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
        <Box sx={{ p: 4, borderRadius: 4, background: alpha(theme.palette.warning.main, 0.05), border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`, mb: 4 }}>
          <TimerIcon sx={{ fontSize: 60, color: theme.palette.warning.main, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: theme.palette.warning.main }}>Session Expired</Typography>
          <Typography color="text.secondary">
            Your locked seats have been released due to inactivity. Please return to the event page to select them again.
          </Typography>
        </Box>
        <Button variant="outlined" size="large" onClick={() => router.push(`/events/${eventId}`)}>
          Back to Event Map
        </Button>
      </Container>
    );
  }

  const totalAmount = seats.reduce((sum, s) => sum + Number(s.zone.price), 0);

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 6 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
          <ShoppingBag />
        </Box>
        <Typography variant="h3" fontWeight={800} sx={{ fontFamily: '"Outfit", sans-serif' }}>
          Secure Checkout
        </Typography>
      </Stack>

      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography variant="h5" fontWeight={800}>Order Summary</Typography>
              <CheckoutTimer seats={seats} onExpire={() => setIsExpired(true)} />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Event</Typography>
              <Typography variant="h6" color="primary" fontWeight={800} sx={{ mt: 0.5 }}>
                {event?.title}
              </Typography>
            </Box>

            <List disablePadding>
              {seats.map((seat) => (
                <ListItem key={seat.id} sx={{ py: 2.5, px: 0, borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                  <Box sx={{ mr: 2, p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.03)' }}>
                    <ConfirmationNumber sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </Box>
                  <ListItemText
                    primary={`${seat.zone.name} Zone`}
                    secondary={`Row ${seat.rowName}, Seat ${seat.seatNumber}`}
                    primaryTypographyProps={{ fontWeight: 800, color: 'white' }}
                    secondaryTypographyProps={{ fontWeight: 600, color: 'text.secondary' }}
                  />
                  <Typography variant="body1" fontWeight={800} color="white">
                    ${Number(seat.zone.price).toFixed(2)}
                  </Typography>
                </ListItem>
              ))}
            </List>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
              <Typography variant="h5" fontWeight={800}>Total</Typography>
              <Typography variant="h4" fontWeight={900} color="primary">
                ${totalAmount.toFixed(2)}
              </Typography>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)', background: alpha(theme.palette.primary.main, 0.03) }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Payment Method</Typography>
              <Box sx={{ p: 2.5, borderRadius: 3, border: `2px solid ${theme.palette.primary.main}`, background: alpha(theme.palette.primary.main, 0.05), mb: 4 }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                  <PaymentIcon color="primary" />
                  <Typography fontWeight={700}>Direct Booking Credit</Typography>
                </Stack>
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                disabled={confirming || isExpired}
                onClick={handleConfirm}
                startIcon={confirming ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                sx={{ py: 2, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem' }}
              >
                {confirming ? 'Authorizing...' : 'Pay Now'}
              </Button>
            </Paper>

            <Stack direction="row" spacing={2} sx={{ px: 2 }}>
              <ShieldCheck sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Your transaction is secure and encrypted. Tickets will be sent to your email instantly.
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<Box sx={{ display: 'flex', justifyContent: 'center', py: 15 }}><CircularProgress size={60} /></Box>}>
      <CheckoutContent />
    </Suspense>
  );
}
