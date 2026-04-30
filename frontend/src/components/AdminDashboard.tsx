'use client';

import React, { useEffect, useState } from 'react';
import {
  Box, Typography, Card, CardContent, CircularProgress,
  Divider, Paper, LinearProgress, Alert, Stack, alpha, useTheme,
  Chip,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  TrendingUp as RevenueIcon, EventSeat as SeatIcon,
  Lock as LockIcon, CheckCircle as SoldIcon,
  Percent as RateIcon, Event as EventIcon, DashboardCustomize,
} from '@mui/icons-material';
import { useSession } from 'next-auth/react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface EventAnalytics {
  id: number;
  title: string;
  status: string;
  totalSeats: number;
  soldSeats: number;
  lockedSeats: number;
  availableSeats: number;
  fillRate: string;
  totalRevenue: number;
}

function StatCard({ icon, label, value, color, secondary }: {
  icon: React.ReactNode; label: string; value: string | number; color: string; secondary?: string;
}) {
  const theme = useTheme();
  return (
    <Card sx={{
      borderRadius: 5, height: '100%',
      background: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.1)}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': { transform: 'translateY(-6px)', background: alpha(color, 0.08), borderColor: alpha(color, 0.3) }
    }}>
      <Box sx={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
        filter: 'blur(20px)', zIndex: 0
      }} />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{
            p: 1.5, borderRadius: 3, background: alpha(color, 0.1), color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</Typography>
        </Stack>
        <Typography variant="h3" fontWeight={900} sx={{ color: 'white', mb: 0.5 }}>{value}</Typography>
        {secondary && <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600 }}>{secondary}</Typography>}
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const theme = useTheme();
  const [data, setData] = useState<EventAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: session } = useSession();

  useEffect(() => {
    (async () => {
      if (!session?.user?.accessToken) return;
      try {
        const r = await fetch(`${API}/api/booking/admin/analytics`, {
          headers: {
            'Authorization': `Bearer ${session.user.accessToken}`,
          },
        });
        if (!r.ok) throw new Error('Failed to load analytics');
        setData(await r.json());
      } catch (e: any) { setError(e.message); }
      finally { setLoading(false); }
    })();
  }, [session]);

  if (loading) return (
    <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', py: 20, alignItems: 'center', gap: 2 }}>
      <CircularProgress size={60} thickness={5} />
      <Typography color="text.secondary" fontWeight={600}>Loading Dashboard...</Typography>
    </Box>
  );

  if (error) return <Alert severity="error" sx={{ m: 4, borderRadius: 3, fontWeight: 700 }}>{error}</Alert>;

  const totals = data.reduce((acc, e) => ({
    seats: acc.seats + e.totalSeats, sold: acc.sold + e.soldSeats,
    locked: acc.locked + e.lockedSeats, revenue: acc.revenue + Number(e.totalRevenue),
  }), { seats: 0, sold: 0, locked: 0, revenue: 0 });

  const overallFill = totals.seats > 0 ? ((totals.sold / totals.seats) * 100).toFixed(1) : '0.0';

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', py: 8, px: 4 }}>
      <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
          <DashboardCustomize />
        </Box>
        <Box>
          <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
            System Overview
          </Typography>
          <Typography variant="body1" color="text.secondary">Real-time performance across {data.length} active events</Typography>
        </Box>
      </Stack>

      {/* Global Stats */}
      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid xs={12} sm={6} md={3}>
          <StatCard icon={<RevenueIcon />} label="Total Revenue" value={`$${totals.revenue.toLocaleString()}`} color={theme.palette.success.main} secondary="+12.5% from last week" />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard icon={<SeatIcon />} label="Total Inventory" value={totals.seats} color={theme.palette.primary.main} secondary="Across all venues" />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard icon={<SoldIcon />} label="Confirmed Sales" value={totals.sold} color={theme.palette.secondary.main} secondary={`${((totals.sold / totals.seats) * 100).toFixed(1)}% of total capacity`} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard icon={<RateIcon />} label="Global Fill Rate" value={`${overallFill}%`} color={theme.palette.warning.main} secondary="Live occupancy rate" />
        </Grid>
      </Grid>

      {/* Per-Event Breakdown */}
      <Typography variant="h5" fontWeight={800} sx={{ mb: 4, fontFamily: '"Outfit", sans-serif' }}>Live Events Performance</Typography>
      <Grid container spacing={4}>
        {data.map((ev) => (
          <Grid key={ev.id} xs={12} lg={6}>
            <Card sx={{
              borderRadius: 5, border: '1px solid rgba(255,255,255,0.05)',
              background: alpha('#fff', 0.01),
              transition: 'all 0.3s ease',
              '&:hover': { background: alpha('#fff', 0.02), borderColor: alpha(theme.palette.primary.main, 0.2) }
            }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box sx={{ p: 1, borderRadius: 1.5, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
                      <EventIcon fontSize="small" />
                    </Box>
                    <Typography variant="h6" fontWeight={800}>{ev.title}</Typography>
                  </Box>
                  <Chip
                    label={ev.status}
                    size="small"
                    sx={{
                      fontWeight: 800, fontSize: '0.65rem',
                      background: ev.status === 'ONGOING' ? alpha(theme.palette.success.main, 0.1) : 'rgba(255,255,255,0.05)',
                      color: ev.status === 'ONGOING' ? theme.palette.success.main : 'text.secondary',
                      border: 'none'
                    }}
                  />
                </Box>

                <Box sx={{ mb: 4 }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
                    <Typography variant="body2" color="text.secondary" fontWeight={700}>Capacity Fill Rate</Typography>
                    <Typography variant="h6" fontWeight={900} color="primary">{ev.fillRate}%</Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={parseFloat(ev.fillRate)}
                    sx={{
                      height: 10, borderRadius: 5,
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      '& .MuiLinearProgress-bar': { borderRadius: 5, background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})` }
                    }}
                  />
                </Box>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                  {[
                    { label: 'Available', val: ev.availableSeats, color: theme.palette.success.main },
                    { label: 'Locked', val: ev.lockedSeats, color: theme.palette.warning.main },
                    { label: 'Sold', val: ev.soldSeats, color: theme.palette.primary.main },
                  ].map((s) => (
                    <Grid key={s.label} xs={4}>
                      <Box sx={{
                        p: 2, borderRadius: 3, textAlign: 'center',
                        background: alpha(s.color, 0.05), border: `1px solid ${alpha(s.color, 0.1)}`
                      }}>
                        <Typography variant="h5" fontWeight={900} sx={{ color: s.color }}>{s.val}</Typography>
                        <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase' }}>{s.label}</Typography>
                      </Box>
                    </Grid>
                  ))}
                </Grid>

                <Box sx={{
                  p: 2.5, borderRadius: 4, background: alpha(theme.palette.success.main, 0.05),
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                }}>
                  <Typography variant="body2" fontWeight={700}>Total Generated Revenue</Typography>
                  <Typography variant="h5" fontWeight={900} color={theme.palette.success.main}>
                    ${Number(ev.totalRevenue).toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
