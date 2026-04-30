'use client';

import React, { useState } from 'react';
import useSWR, { mutate } from 'swr';
import { fetcher } from '@/lib/fetcher';
import {
  Box,
  Typography,
  Button,
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Stack,
  alpha,
  useTheme,
  IconButton,
  Tooltip,
  Modal,
  TextField,
  MenuItem,
} from '@mui/material';
import { 
  Add as AddIcon, 
  Event as EventIcon, 
  Visibility as ViewIcon, 
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import Link from 'next/link';
import { format } from 'date-fns';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export default function AdminEventsPage() {
  const { data: events, error, isLoading } = useSWR(`${API_URL}/api/events`, fetcher);
  const { data: session } = useSession();
  const theme = useTheme();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Edit Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [editLoading, setEditLoading] = useState(false);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this event? All associated seats and orders will be removed.')) return;
    
    setDeletingId(id);
    try {
      const res = await fetch(`${API_URL}/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`
        }
      });
      if (!res.ok) throw new Error('Failed to delete event');
      mutate(`${API_URL}/api/events`);
    } catch (err) {
      alert('Error deleting event: ' + (err as Error).message);
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (event: any) => {
    // Format date for datetime-local input (YYYY-MM-DDTHH:mm)
    const date = new Date(event.startTime);
    const formattedDate = format(date, "yyyy-MM-dd'T'HH:mm");
    
    setEditingEvent({
      ...event,
      startTime: formattedDate
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setEditLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`
        },
        body: JSON.stringify({
          title: editingEvent.title,
          startTime: editingEvent.startTime,
          status: editingEvent.status
        })
      });

      if (!res.ok) throw new Error('Failed to update event');
      
      await mutate(`${API_URL}/api/events`);
      setEditModalOpen(false);
    } catch (err: any) {
      alert('Error updating event: ' + err.message);
    } finally {
      setEditLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'UPCOMING': return 'primary';
      case 'ONGOING': return 'success';
      case 'ENDED': return 'default';
      default: return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
            <EventIcon />
          </Box>
          <Box>
            <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
              Events Management
            </Typography>
            <Typography variant="body1" color="text.secondary">Manage your platform events and seat mappings</Typography>
          </Box>
        </Box>
        
        <Button
          variant="contained"
          component={Link}
          href="/admin/events/new"
          startIcon={<AddIcon />}
          sx={{
            borderRadius: 3,
            px: 3,
            py: 1.5,
            fontWeight: 700,
            boxShadow: '0 8px 20px rgba(0, 242, 254, 0.2)'
          }}
        >
          Create New Event
        </Button>
      </Stack>

      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress thickness={5} size={60} />
        </Box>
      ) : error ? (
        <Paper sx={{ p: 4, textAlign: 'center', border: '1px dashed rgba(255,0,0,0.3)', borderRadius: 4 }}>
          <Typography color="error">Failed to load events. Please ensure the backend is running.</Typography>
        </Paper>
      ) : (
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
                <TableRow 
                  key={event.id}
                  sx={{ 
                    '&:hover': { background: alpha('#fff', 0.02) },
                    transition: 'background 0.2s'
                  }}
                >
                  <TableCell sx={{ fontWeight: 700 }}>#{event.id}</TableCell>
                  <TableCell>
                    <Typography variant="body1" fontWeight={800}>{event.title}</Typography>
                  </TableCell>
                  <TableCell sx={{ color: 'text.secondary', fontWeight: 600 }}>
                    {format(new Date(event.startTime), 'MMM dd, yyyy • HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      label={event.status} 
                      size="small" 
                      color={getStatusColor(event.status) as any}
                      sx={{ fontWeight: 800, fontSize: '0.65rem', borderRadius: 1.5 }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="Edit Event">
                        <IconButton 
                          size="small" 
                          color="info"
                          onClick={() => handleEditClick(event)}
                        >
                          <EditIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="View Live Page">
                        <IconButton 
                          size="small" 
                          color="primary"
                          component={Link}
                          href={`/events/${event.id}`}
                        >
                          <ViewIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete Event">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => handleDelete(event.id)}
                          disabled={deletingId === event.id}
                        >
                          {deletingId === event.id ? <CircularProgress size={20} /> : <DeleteIcon fontSize="small" />}
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Event Modal */}
      <Modal
        open={editModalOpen}
        onClose={() => !editLoading && setEditModalOpen(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper sx={{ p: 4, width: '100%', maxWidth: 500, borderRadius: 2, background: '#111827', border: '1px solid rgba(255,255,255,0.1)' }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={800}>Edit Event Information</Typography>
            <IconButton size="small" onClick={() => setEditModalOpen(false)} disabled={editLoading}>
              <CloseIcon />
            </IconButton>
          </Stack>

          {editingEvent && (
            <Box component="form" onSubmit={handleEditSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  label="Event Title"
                  value={editingEvent.title}
                  onChange={(e) => setEditingEvent({...editingEvent, title: e.target.value})}
                  required
                />
                <TextField
                  fullWidth
                  label="Start Time"
                  type="datetime-local"
                  InputLabelProps={{ shrink: true }}
                  value={editingEvent.startTime}
                  onChange={(e) => setEditingEvent({...editingEvent, startTime: e.target.value})}
                  required
                />
                <TextField
                  fullWidth
                  select
                  label="Status"
                  value={editingEvent.status}
                  onChange={(e) => setEditingEvent({...editingEvent, status: e.target.value})}
                  required
                >
                  <MenuItem value="UPCOMING">Upcoming</MenuItem>
                  <MenuItem value="ONGOING">Ongoing</MenuItem>
                  <MenuItem value="ENDED">Ended</MenuItem>
                </TextField>

                <Box sx={{ pt: 2 }}>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={editLoading}
                    startIcon={editLoading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                    sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                  >
                    Save Changes
                  </Button>
                </Box>
              </Stack>
            </Box>
          )}
        </Paper>
      </Modal>
    </Container>
  );
}
