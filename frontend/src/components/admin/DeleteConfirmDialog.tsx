'use client';

import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  alpha,
  useTheme
} from '@mui/material';
import { Warning as WarningIcon } from '@mui/icons-material';

interface DeleteConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  loading?: boolean;
}

export default function DeleteConfirmDialog({ open, onClose, onConfirm, title, loading }: DeleteConfirmDialogProps) {
  const theme = useTheme();

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      PaperProps={{
        sx: {
          borderRadius: 4,
          background: '#111827',
          border: '1px solid rgba(255,255,255,0.1)',
          p: 2,
          maxWidth: 400
        }
      }}
    >
      <DialogContent sx={{ textAlign: 'center', pt: 4 }}>
        <Box sx={{ 
          display: 'inline-flex', 
          p: 2, 
          borderRadius: '50%', 
          background: alpha(theme.palette.error.main, 0.1),
          color: theme.palette.error.main,
          mb: 3
        }}>
          <WarningIcon sx={{ fontSize: 40 }} />
        </Box>
        <DialogTitle sx={{ p: 0, mb: 1, fontWeight: 800 }}>Delete Event?</DialogTitle>
        <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
          Are you sure you want to delete <strong>"{title}"</strong>? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 1 }}>
        <Button 
          fullWidth 
          onClick={onClose} 
          variant="outlined" 
          disabled={loading}
          sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
        >
          Cancel
        </Button>
        <Button 
          fullWidth 
          onClick={onConfirm} 
          variant="contained" 
          color="error"
          disabled={loading}
          sx={{ borderRadius: 2, py: 1, fontWeight: 700 }}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
