'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { mutate } from 'swr';
import {
  Box, Typography, Paper, Button, Alert, List, ListItem, ListItemText, Grid, Stack, alpha, useTheme, CircularProgress
} from '@mui/material';
import { Payment as PaymentIcon, ConfirmationNumber, Timer as TimerIcon, VerifiedUser as ShieldCheck } from '@mui/icons-material';
import CheckoutTimer from './CheckoutTimer';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface CheckoutFormProps {
  initialEvent: any;
  initialSeats: any[];
  eventId: string;
  accessToken: string;
}

export default function CheckoutForm({ initialEvent, initialSeats, eventId, accessToken }: CheckoutFormProps) {
  const theme = useTheme();
  const router = useRouter();
  const [seats] = useState(initialSeats);
  const [event] = useState(initialEvent);
  const [error, setError] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [releasing, setReleasing] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  const handleConfirm = async () => {
    setConfirming(true);
    setError(null);
    try {
      const seatIds = seats.map((s) => s.id);
      const res = await fetch(`${API}/api/booking/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ eventId: Number(eventId), seatIds }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Payment failed or seats expired');
        setConfirming(false);
      }
      router.push('/my-tickets');
    } catch (err: any) {
      setError(err.message);
      setConfirming(false);
    }
  };

  const handleRelease = async () => {
    setReleasing(true);
    setError(null);
    try {
      const seatIds = seats.map((s) => s.id);
      const res = await fetch(`${API}/api/booking/release`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ eventId: Number(eventId), seatIds }),
      });
      if (!res.ok) throw new Error('Failed to release seats');
      mutate(`${API}/api/booking/my-locks`);
      router.push(`/events/${eventId}`);
    } catch (err: any) {
      setError(err.message);
      setReleasing(false);
    }
  };

  if (seats.length === 0 || isExpired) {
    return (
      <Container maxWidth="sm" sx={{ py: 15, textAlign: 'center' }}>
        <Box sx={{ p: 4, borderRadius: 4, background: alpha(theme.palette.warning.main, 0.05), border: `1px dashed ${alpha(theme.palette.warning.main, 0.2)}`, mb: 4 }}>
          <TimerIcon sx={{ fontSize: 60, color: theme.palette.warning.main, mb: 2, opacity: 0.5 }} />
          <Typography variant="h5" fontWeight={800} gutterBottom sx={{ color: theme.palette.warning.main }}>Session Expired</Typography>
          <Typography color="text.secondary">
            Your locked seats have been released. Please return to the event page.
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
    <Box>
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

              <Stack spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={confirming || isExpired || releasing}
                  onClick={handleConfirm}
                  startIcon={confirming ? <CircularProgress size={20} color="inherit" /> : <PaymentIcon />}
                  sx={{ py: 2, borderRadius: 4, fontWeight: 800, fontSize: '1.1rem' }}
                >
                  {confirming ? 'Authorizing...' : 'Pay Now'}
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  color="error"
                  size="large"
                  disabled={confirming || isExpired || releasing}
                  onClick={handleRelease}
                  sx={{ py: 1.5, borderRadius: 4, fontWeight: 800 }}
                >
                  {releasing ? 'Releasing...' : 'Cancel & Release Seats'}
                </Button>
              </Stack>
            </Paper>

            <Stack direction="row" spacing={2} sx={{ px: 2 }}>
              <ShieldCheck sx={{ color: 'success.main', fontSize: 20 }} />
              <Typography variant="caption" color="text.secondary" fontWeight={500}>
                Your transaction is secure and encrypted.
              </Typography>
            </Stack>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

import { Container } from '@mui/material';
