'use client';

import React, { useState } from 'react';
import {
  Box, Typography, Button, Paper, Stack, Modal, TextField, MenuItem, IconButton, CircularProgress, alpha
} from '@mui/material';
import { Close as CloseIcon, Save as SaveIcon } from '@mui/icons-material';
import { mutate } from 'swr';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

interface EditEventModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  event: any;
  accessToken: string;
}

export default function EditEventModal({ open, onClose, onSuccess, event, accessToken }: EditEventModalProps) {
  const [editingEvent, setEditingEvent] = useState(event);
  const [loading, setLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(event.bannerUrl || null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalBannerUrl = editingEvent.bannerUrl;

      // 1. Upload new file if selected
      if (selectedFile) {
        const formData = new FormData();
        formData.append('file', selectedFile);

        const uploadRes = await fetch(`${API_URL}/api/upload/banner`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          },
          body: formData
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(`Upload failed (${uploadRes.status}): ${errorText || 'Internal Server Error'}`);
        }
        
        const uploadData = await uploadRes.json();
        finalBannerUrl = uploadData.url;
      }

      const res = await fetch(`${API_URL}/api/events/${editingEvent.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify({
          title: editingEvent.title,
          startTime: editingEvent.startTime,
          status: editingEvent.status,
          description: editingEvent.description,
          location: editingEvent.location,
          bannerUrl: finalBannerUrl
        })
      });

      if (!res.ok) throw new Error('Failed to update event');

      await mutate(`${API_URL}/api/events`);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      alert('Error updating event: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={() => !loading && onClose()}
      sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <Paper sx={{
        width: '100%',
        maxWidth: 500,
        borderRadius: 1,
        background: '#111827',
        border: '1px solid rgba(255,255,255,0.1)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
      }}>
        <Box sx={{
          p: 4,
          maxHeight: '90vh',
          overflowY: 'auto',
          '&::-webkit-scrollbar': { width: '6px' },
          '&::-webkit-scrollbar-track': { background: 'transparent' },
          '&::-webkit-scrollbar-thumb': { background: alpha('#fff', 0.1), borderRadius: '10px' },
          '&::-webkit-scrollbar-thumb:hover': { background: alpha('#fff', 0.2) },
        }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 3 }}>
            <Typography variant="h5" fontWeight={800}>Edit Event Information</Typography>
            <IconButton size="small" onClick={onClose} disabled={loading}>
              <CloseIcon />
            </IconButton>
          </Stack>

          <Box component="form" onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                fullWidth
                label="Event Title"
                value={editingEvent.title}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
                required
              />
              <TextField
                fullWidth
                label="Start Time"
                type="datetime-local"
                InputLabelProps={{ shrink: true }}
                value={editingEvent.startTime}
                onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                required
              />
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
              />
              <TextField
                fullWidth
                label="Location"
                value={editingEvent.location || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
              />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 800, mb: 1, display: 'block' }}>Banner Image</Typography>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Button variant="outlined" component="label" size="small" sx={{ borderRadius: 2 }}>
                    Change Image
                    <input type="file" hidden accept="image/*" onChange={handleFileChange} />
                  </Button>
                  {selectedFile && <Typography variant="caption">{selectedFile.name}</Typography>}
                </Stack>
              </Box>

              {previewUrl && (
                <Box sx={{ width: '100%', height: 120, borderRadius: 2, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <img src={previewUrl.startsWith('/') ? `${API_URL}${previewUrl}` : previewUrl} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              )}
              <TextField
                fullWidth
                select
                label="Status"
                value={editingEvent.status}
                onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
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
                  disabled={loading}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                  sx={{ py: 1.5, fontWeight: 700, borderRadius: 2 }}
                >
                  Save Changes
                </Button>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Paper>
    </Modal>
  );
}
