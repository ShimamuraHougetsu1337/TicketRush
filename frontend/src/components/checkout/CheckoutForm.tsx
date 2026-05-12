'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import useSWR, { mutate } from 'swr';
import {
  Box, Typography, Paper, Button, Alert, List, ListItem, ListItemText, Grid, Stack, alpha, useTheme, CircularProgress
} from '@mui/material';
import { Payment as PaymentIcon, ConfirmationNumber, Timer as TimerIcon, VerifiedUser as ShieldCheck } from '@mui/icons-material';
import CheckoutTimer from './CheckoutTimer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface CheckoutFormProps {
  initialSeats: any[];
  accessToken: string;
}

export default function CheckoutForm({ initialSeats, accessToken }: CheckoutFormProps) {
  const theme = useTheme();
  const router = useRouter();

  const fetcher = (url: string) => fetch(url, {
    headers: { 'Authorization': `Bearer ${accessToken}` }
  }).then(res => res.json());

  const { data: seats = initialSeats, error: swrError, isLoading } = useSWR(
    `${API}/api/booking/my-locks`,
    fetcher,
    {
      fallbackData: initialSeats,
      revalidateOnFocus: true,
      refreshInterval: 10000
    }
  );

  const [error, setError] = useState<string | null>(null);
  const [confirmingEventId, setConfirmingEventId] = useState<number | null>(null);
  const [releasingEventId, setReleasingEventId] = useState<number | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  const handleConfirm = async (eventId: number, eventSeats: any[]) => {
    setConfirmingEventId(eventId);
    setError(null);
    try {
      const seatIds = eventSeats.map((s) => s.id);
      const res = await fetch(`${API}/api/booking/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ eventId, seatIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Payment failed or seats expired');
      }

      // SWR will re-fetch automatically, but we can also manually mutate
      mutate(`${API}/api/booking/my-locks`);

      if (seats.length <= eventSeats.length) {
        router.push('/my-tickets');
      } else {
        setConfirmingEventId(null);
      }
    } catch (err: any) {
      setError(err.message);
      setConfirmingEventId(null);
    }
  };

  const handleRelease = async (eventId: number, eventSeats: any[]) => {
    setReleasingEventId(eventId);
    setError(null);
    try {
      const seatIds = eventSeats.map((s) => s.id);
      const res = await fetch(`${API}/api/booking/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ eventId, seatIds }),
      });
      if (!res.ok) throw new Error('Failed to release seats');

      mutate(`${API}/api/booking/my-locks`);
      mutate(`${API}/api/booking/my-locks`);
      if (seats.length <= eventSeats.length) {
        router.push('/');
      } else {
        setReleasingEventId(null);
      }
    } catch (err: any) {
      setError(err.message);
      setReleasingEventId(null);
    }
  };

  if (seats.length === 0 || isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
        <Box sx={{ p: 4, borderRadius: 4, background: alpha(theme.palette.warning.main, 0.05), border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`, mb: 4 }}>
          <TimerIcon sx={{ fontSize: 60, color: theme.palette.warning.main, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: theme.palette.warning.main }}>Session Expired</Typography>
          <Typography color="text.secondary">
            Your locked seats have been released. Please return to the homepage.
          </Typography>
        </Box>
        <Button variant="outlined" size="large" onClick={() => router.push('/')}>
          Back to Events
        </Button>
      </Container>
    );
  }

  const groupedSeats = seats.reduce((acc: any, seat: any) => {
    const eid = seat.eventId;
    if (!acc[eid]) acc[eid] = { event: seat.event, seats: [] };
    acc[eid].seats.push(seat);
    return acc;
  }, {} as any);

  const eventIds = Object.keys(groupedSeats);

  const totalAmount = seats.reduce((sum: number, s: any) => sum + Number(s.zone.price), 0);

  return (
    <Box>
      {error && <Alert severity="error" sx={{ mb: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

      <Stack spacing={6}>
        {eventIds.map((eid) => {
          const { event, seats: eventSeats } = groupedSeats[eid];
          const totalAmount = eventSeats.reduce((sum: number, s: any) => sum + Number(s.zone.price), 0);
          const eventIdNum = Number(eid);

          return (
            <Grid container spacing={4} key={eid}>
              <Grid item xs={12} md={7}>
                <Paper elevation={0} sx={{ p: 4, border: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.01)' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                    <Typography variant="h5" fontWeight={800}>Order Summary</Typography>
                    <CheckoutTimer seats={eventSeats} onExpire={() => setIsExpired(true)} />
                  </Box>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 700 }}>Event</Typography>
                    <Typography variant="h6" color="primary" fontWeight={800} sx={{ mt: 0.5 }}>
                      {event?.title}
                    </Typography>
                  </Box>

                  <List disablePadding>
                    {eventSeats.map((seat: any) => (
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
                    <Typography variant="h5" fontWeight={800}>Subtotal</Typography>
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

                    <Stack spacing={2}>
                      <Button
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={confirmingEventId === eventIdNum || isExpired || releasingEventId === eventIdNum}
                        onClick={() => handleConfirm(eventIdNum, eventSeats)}
                        startIcon={confirmingEventId === eventIdNum ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                        sx={{ py: 2, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem' }}
                      >
                        {confirmingEventId === eventIdNum ? 'Authorizing...' : 'Pay Now'}
                      </Button>
                      <Button
                        fullWidth
                        variant="outlined"
                        color="error"
                        size="large"
                        disabled={confirmingEventId === eventIdNum || isExpired || releasingEventId === eventIdNum}
                        onClick={() => handleRelease(eventIdNum, eventSeats)}
                        sx={{ py: 1.5, borderRadius: 4, fontWeight: 800 }}
                      >
                        {releasingEventId === eventIdNum ? 'Releasing...' : 'Cancel & Release Seats'}
                      </Button>
                    </Stack>
                  </Paper>

                  <Stack direction="row" spacing={2} sx={{ px: 2 }}>
                    <ShieldCheck sx={{ color: 'success.main', fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Secure payment for {event?.title}
                    </Typography>
                  </Stack>
                </Stack>
              </Grid>
            </Grid>
          );
        })}
      </Stack>
    </Box>
  );
}

import { Container } from '@mui/material';
