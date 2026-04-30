'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box, Container, Typography, Paper, Grid, Chip, CircularProgress, Alert, Divider, Stack, alpha, useTheme,
  Button
} from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ConfirmationNumber, CalendarToday, LocationOn, LocalActivity } from '@mui/icons-material';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function MyTicketsPage() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }
    if (status === 'loading' || !session?.user?.accessToken) return;

    const fetchTickets = async () => {
      try {
        const res = await fetch(`${API}/api/booking/my-tickets`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        });
        if (!res.ok) throw new Error('Failed to load tickets');
        setOrders(await res.json());
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [session, status, router]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 20, alignItems: 'center', gap: 2 }}>
        <CircularProgress size={60} thickness={5} />
        <Typography color="text.secondary" fontWeight={600}>Retrieving your tickets...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 10 }}>
      {/* Header */}
      <Box sx={{ pt: 10, pb: 8, borderBottom: '1px solid rgba(255, 255, 255, 0.05)', background: alpha(theme.palette.primary.main, 0.03) }}>
        <Container maxWidth="lg">
          <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
              <LocalActivity />
            </Box>
            <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
              My Tickets
            </Typography>
          </Stack>
          <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
            Here are all your confirmed bookings. Show these QR codes at the venue entrance.
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ mt: 8 }}>
        {error && <Alert severity="error" sx={{ mb: 6, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>}

        {orders.length === 0 ? (
          <Paper elevation={0} sx={{ p: 10, textAlign: 'center', borderRadius: 6, border: '1px dashed rgba(255,255,255,0.1)', background: alpha('#fff', 0.01) }}>
            <ConfirmationNumber sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.2 }} />
            <Typography variant="h5" fontWeight={800} gutterBottom>No tickets found</Typography>
            <Typography color="text.secondary" sx={{ mb: 4 }}>You haven't purchased any tickets yet. Explore events and grab some!</Typography>
            <Button variant="contained" onClick={() => router.push('/')}>Browse Events</Button>
          </Paper>
        ) : (
          <Stack spacing={10}>
            {orders.map((order) => (
              <Box key={order.id}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: theme.palette.primary.main, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1px' }}>
                      Order #{order.id}
                    </Typography>
                    <Typography variant="h4" fontWeight={900} sx={{ mt: 0.5, fontFamily: '"Outfit", sans-serif' }}>
                      {order.event.title}
                    </Typography>
                  </Box>
                  <Chip
                    label={`Paid $${Number(order.totalAmount).toFixed(2)}`}
                    sx={{ fontWeight: 800, background: alpha(theme.palette.success.main, 0.1), color: theme.palette.success.main, border: 'none' }}
                  />
                </Box>

                <Stack direction="row" spacing={4} sx={{ mb: 4, color: 'text.secondary' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarToday fontSize="small" color="primary" />
                    <Typography variant="body2" fontWeight={600}>{format(new Date(order.event.startTime), 'MMMM do, yyyy • h:mm a')}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LocationOn fontSize="small" color="secondary" />
                    <Typography variant="body2" fontWeight={600}>Grand Stadium Arena</Typography>
                  </Box>
                </Stack>

                <Grid container spacing={3}>
                  {order.seats.map((seat: any) => (
                    <Grid item xs={12} md={6} lg={4} key={seat.id}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 0,
                          borderRadius: 6,
                          overflow: 'hidden',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          transition: 'all 0.3s ease',
                          '&:hover': { transform: 'translateY(-6px)', borderColor: alpha(theme.palette.primary.main, 0.3) }
                        }}
                      >
                        <Box sx={{ p: 3, borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
                          <Typography variant="h6" fontWeight={800} color="primary" sx={{ mb: 0.5 }}>
                            {seat.zone.name} Zone
                          </Typography>
                          <Typography variant="body2" fontWeight={700} color="text.secondary">
                            Row {seat.rowName} • Seat {seat.seatNumber}
                          </Typography>
                        </Box>

                        <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Box sx={{ p: 2.5, background: 'white', borderRadius: 4, mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
                            <QRCodeSVG value={seat.ticketCode || 'invalid'} size={160} />
                          </Box>

                          <Typography variant="caption" sx={{ fontFamily: 'monospace', letterSpacing: 4, fontWeight: 700, color: alpha('#fff', 0.5) }}>
                            {seat.ticketCode}
                          </Typography>
                        </Box>

                        <Box sx={{ py: 1.5, textAlign: 'center', background: alpha(theme.palette.primary.main, 0.05) }}>
                          <Typography variant="caption" fontWeight={800} color="primary">VALID ADMISSION TICKET</Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
