'use client';

import React from 'react';
import { mutate } from 'swr';
import {
  Box, Typography, Button, Badge, Stack, Paper, CircularProgress
} from '@mui/material';
import {
  ShoppingCart as CartIcon,
  Lock as LockIcon,
} from '@mui/icons-material';
import { useSeatStore } from '@/store/seat-store';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

interface FloatingActionBarProps {
  eventId: number;
  myLockedIds: number[];
}

export default function FloatingActionBar({ eventId, myLockedIds }: FloatingActionBarProps) {
  const selectedIds = useSeatStore(state => state.selectedIds);
  const clearSelection = useSeatStore(state => state.clearSelection);
  const loading = useSeatStore(state => state.loading);
  const setLoading = useSeatStore(state => state.setLoading);
  const setError = useSeatStore(state => state.setError);
  const { data: session } = useSession();
  const router = useRouter();

  const doPost = async (url: string, seatIds: number[], redirectUrl?: string) => {
    if (!session?.user?.accessToken) {
      setError('You must be logged in to book seats.');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API}${url}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.user.accessToken}` },
        body: JSON.stringify({ eventId, seatIds }),
      });
      if (!r.ok) { const e = await r.json(); throw new Error(e.message ?? 'Request failed'); }
      clearSelection();
      mutate(`${API}/api/booking/my-locks`);
      if (redirectUrl) router.push(redirectUrl);
    } catch (e: any) { setError(e.message); }
    finally { setLoading(false); }
  };

  const handleLock = () => {
    if (selectedIds.size > 0) {
      doPost('/api/booking/lock', Array.from(selectedIds));
    } else if (myLockedIds.length > 0) {
      router.push(`/checkout`);
    }
  };

  if (selectedIds.size === 0 && myLockedIds.length === 0) return null;

  return (
    <Paper
      elevation={24}
      sx={{
        position: 'fixed', bottom: 32, left: '50%', transform: 'translateX(-50%)',
        width: '90%', maxWidth: 600, p: 2.5, borderRadius: 6,
        background: 'rgba(17, 24, 39, 0.8)', backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
      }}
    >
      <Stack direction="row" spacing={3} alignItems="center">
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Badge badgeContent={selectedIds.size} color="primary">
            <Box sx={{ p: 1, borderRadius: 2, background: 'rgba(255,255,255,0.05)' }}>
              <CartIcon sx={{ fontSize: 20 }} />
            </Box>
          </Badge>
          <Box>
            <Typography variant="body2" fontWeight={800} sx={{ color: 'white' }}>
              {selectedIds.size} Seats
            </Typography>
            <Typography variant="caption" color="text.secondary">Selected</Typography>
          </Box>
        </Box>

        {selectedIds.size > 0 && (
          <Button size="small" onClick={clearSelection} sx={{ color: 'text.secondary', fontSize: '0.7rem', fontWeight: 800 }}>
            CLEAR
          </Button>
        )}
      </Stack>

      <Button
        variant="contained"
        disabled={(!selectedIds.size && myLockedIds.length === 0) || loading}
        onClick={handleLock}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : (selectedIds.size > 0 ? <LockIcon /> : <CartIcon />)}
        sx={{ px: 4, py: 1.5, borderRadius: 4, fontSize: '0.9rem' }}
      >
        {selectedIds.size > 0 ? 'Lock Seats' : 'Continue to Checkout'}
      </Button>
    </Paper>
  );
}
