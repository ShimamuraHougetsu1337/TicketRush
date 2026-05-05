'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Stack, alpha, useTheme, Chip, LinearProgress, Button,
  IconButton, Snackbar, Alert
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import {
  TrendingUp as RevenueIcon,
  Percent as RateIcon,
  Event as EventIcon,
  Group as AudienceIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  BarChart as StatsIcon,
  ShoppingBag as OrderIcon,
  ConfirmationNumber as TicketIcon,
} from '@mui/icons-material';
import Link from 'next/link';

import DashboardHeader from './admin/DashboardHeader';
import StatCard from './admin/StatCard';
import DemographicsCharts from './admin/DemographicsCharts';
import EditEventModal from './admin/EditEventModal';
import DeleteConfirmDialog from './admin/DeleteConfirmDialog';
import { mutate } from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface AdminDashboardProps {
  initialData: any;
  accessToken: string;
}

export default function AdminDashboard({ initialData, accessToken }: AdminDashboardProps) {
  const theme = useTheme();
  const [data, setData] = useState(initialData?.stats || []);
  const [demographics] = useState(initialData?.demographics || null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleEditSuccess = () => {
    setSuccessMsg('Event updated successfully!');
    setEditingEvent(null);
  };

  const handleDelete = async () => {
    if (!deletingEvent) return;
    setDeleteLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${deletingEvent.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      if (!res.ok) throw new Error('Failed to delete event');
      setData(data.filter((e: any) => e.id !== deletingEvent.id));
      mutate(`${API_URL}/api/events`);
      setSuccessMsg('Event deleted successfully!');
      setDeletingEvent(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (ev: any) => {
    setEditingEvent({
      ...ev,
      startTime: new Date(ev.startTime).toISOString().slice(0, 16)
    });
  };

  const totals = data.reduce((acc: any, e: any) => ({
    seats: acc.seats + e.totalSeats,
    sold: acc.sold + e.soldSeats,
    locked: acc.locked + e.lockedSeats,
    revenue: acc.revenue + Number(e.totalRevenue),
  }), { seats: 0, sold: 0, locked: 0, revenue: 0 });

  const overallFill = totals.seats > 0 ? ((totals.sold / totals.seats) * 100).toFixed(1) : '0.0';

  return (
    <Box sx={{ maxWidth: 1400, mx: 'auto', py: 8, px: 4 }}>
      <DashboardHeader eventCount={data.length} />

      <Grid container spacing={4} sx={{ mb: 8 }}>
        <Grid xs={12} md={6}>
          <Card sx={{ borderRadius: 2, border: '1px solid rgba(255,255,255,0.05)', background: alpha(theme.palette.primary.main, 0.03), height: '100%' }}>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h6" fontWeight={800} sx={{ mb: 3 }}>Quick Management</Typography>
              <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap sx={{ gap: 2 }}>
                <Button variant="contained" component={Link} href="/admin/events/new" startIcon={<AddIcon />} sx={{ borderRadius: 3, px: 3, py: 1.5 }}>
                  New Event
                </Button>
                <Button variant="outlined" component={Link} href="/admin/events" startIcon={<EventIcon />} sx={{ borderRadius: 3, px: 3, py: 1.5 }}>
                  Manage Events
                </Button>
                <Button variant="outlined" color="success" component={Link} href="/admin/orders" startIcon={<OrderIcon />} sx={{ borderRadius: 3, px: 3, py: 1.5 }}>
                  View Orders
                </Button>
                <Button variant="outlined" color="secondary" component={Link} href="/admin/tickets" startIcon={<TicketIcon />} sx={{ borderRadius: 3, px: 3, py: 1.5 }}>
                  All Tickets
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard icon={<RevenueIcon />} label="Total Revenue" value={`$${totals.revenue.toLocaleString()}`} color={theme.palette.success.main} />
        </Grid>
        <Grid xs={12} sm={6} md={3}>
          <StatCard icon={<RateIcon />} label="Global Fill Rate" value={`${overallFill}%`} color={theme.palette.warning.main} />
        </Grid>
      </Grid>

      <Typography variant="h5" fontWeight={800} sx={{ mb: 4, fontFamily: '"Outfit", sans-serif', display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <AudienceIcon color="primary" /> Audience Demographics
      </Typography>

      <DemographicsCharts demographics={demographics} loading={false} />

      <Typography variant="h5" fontWeight={800} sx={{ mb: 4, fontFamily: '"Outfit", sans-serif' }}>Live Events Performance</Typography>
      <Grid container spacing={4}>
        {data.map((ev: any) => (
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
                  <Stack direction="row" spacing={1}>
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
                    <IconButton size="small" component={Link} href={`/admin/events/${ev.id}/stats`} sx={{ color: 'secondary.main' }}>
                      <StatsIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => handleEditClick(ev)} sx={{ color: 'primary.main' }}>
                      <EditIcon fontSize="small" />
                    </IconButton>
                    <IconButton size="small" onClick={() => setDeletingEvent(ev)} sx={{ color: 'error.main' }}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Stack>
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

      {editingEvent && (
        <EditEventModal
          open={!!editingEvent}
          onClose={() => setEditingEvent(null)}
          onSuccess={handleEditSuccess}
          event={editingEvent}
          accessToken={accessToken}
        />
      )}

      <DeleteConfirmDialog
        open={!!deletingEvent}
        onClose={() => setDeletingEvent(null)}
        onConfirm={handleDelete}
        title={deletingEvent?.title || ''}
        loading={deleteLoading}
      />

      <Snackbar 
        open={!!successMsg} 
        autoHideDuration={4000} 
        onClose={() => setSuccessMsg(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" sx={{ width: '100%', borderRadius: 2, fontWeight: 700 }}>
          {successMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
}
