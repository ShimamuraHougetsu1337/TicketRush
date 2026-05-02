'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip,
  CircularProgress, Stack, alpha, useTheme, IconButton, Tooltip,
  Snackbar, Alert
} from '@mui/material';
import { 
  Visibility as ViewIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  BarChart as StatsIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import EditEventModal from './EditEventModal';
import DeleteConfirmDialog from './DeleteConfirmDialog';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function EventsTable({ accessToken }: { accessToken: string }) {
  const { data: events, error, isLoading } = useSWR(`${API_URL}/api/events`, fetcher);
  const theme = useTheme();
  const [deletingEvent, setDeletingEvent] = useState<any>(null);
  const [editingEvent, setEditingEvent] = useState<any>(null);
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
      mutate(`${API_URL}/api/events`);
      setSuccessMsg('Event deleted successfully!');
      setDeletingEvent(null);
    } catch (err: any) {
      alert('Error: ' + err.message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleEditClick = (event: any) => {
    const date = new Date(event.startTime);
    const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
    setEditingEvent({ ...event, startTime: formattedDate });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'primary';
      case 'ONGOING': return 'success';
      case 'ENDED': return 'default';
      default: return 'default';
    }
  };

  if (isLoading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress thickness={5} size={60} /></Box>;
  if (error) return <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed rgba(255,0,0,0.3)', borderRadius: 4 }}><Typography color="error">Failed to load events.</Typography></Paper>;

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 1, border: '1px solid rgba(255,255,255,0.05)', background: alpha('#fff', 0.01) }}>
        <Table>
          <TableHead>
            <TableRow sx={{ background: alpha('#fff', 0.02) }}>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>EVENT TITLE</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>START TIME</TableCell>
              <TableCell sx={{ fontWeight: 800, color: 'text.secondary' }}>STATUS</TableCell>
              <TableCell align="right" sx={{ fontWeight: 800, color: 'text.secondary' }}>ACTIONS</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events?.map((event: any) => (
              <TableRow key={event.id} sx={{ '&:hover': { background: alpha('#fff', 0.02) }, transition: 'background 0.2s' }}>
                <TableCell sx={{ fontWeight: 700 }}>#{event.id}</TableCell>
                <TableCell><Typography variant="body1" fontWeight={800}>{event.title}</Typography></TableCell>
                <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>{format(new Date(event.startTime), 'MMM dd, yyyy • HH:mm')}</TableCell>
                <TableCell>
                  <Chip label={event.status} size="small" color={getStatusColor(event.status) as any} sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5 }} />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" spacing={1} justifyContent="flex-end">
                    <Tooltip title="View Stats">
                      <IconButton size="small" color="secondary" component={Link} href={`/admin/events/${event.id}/stats`}>
                        <StatsIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Event"><IconButton size="small" color="info" onClick={() => handleEditClick(event)}><EditIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="View Live Page"><IconButton size="small" color="primary" component={Link} href={`/events/${event.id}`}><ViewIcon fontSize="small" /></IconButton></Tooltip>
                    <Tooltip title="Delete Event"><IconButton size="small" color="error" onClick={() => setDeletingEvent(event)}><DeleteIcon fontSize="small" /></IconButton></Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
