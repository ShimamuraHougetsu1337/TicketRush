'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';
import { SeatData } from '@/store/seat-store';

interface LockCountdownProps {
  seats: SeatData[];
  currentUserId: number | null;
}

export default function LockCountdown({ seats, currentUserId }: LockCountdownProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  const myLockedSeats = useMemo(() =>
    seats.filter(s => s.status === 'LOCKED' && s.lockedById === currentUserId && s.lockedAt),
    [seats, currentUserId]
  );

  useEffect(() => {
    if (myLockedSeats.length === 0) return;

    const interval = setInterval(() => {
      const lockTimes = myLockedSeats.map(s => new Date(s.lockedAt!).getTime());
      const earliestLock = Math.min(...lockTimes);
      const expiryTime = earliestLock + 10 * 60 * 1000;
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        clearInterval(interval);
        window.location.reload(); 
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [myLockedSeats]);

  if (myLockedSeats.length === 0) return null;

  return (
    <Box sx={{
      display: 'flex', alignItems: 'center', gap: 1, px: 2, py: 1,
      background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444',
      borderRadius: 2, border: '1px solid rgba(239, 68, 68, 0.3)'
    }}>
      <TimerIcon fontSize="small" />
      <Typography variant="body2" fontWeight={800}>
        Time to checkout: {timeLeft}
      </Typography>
    </Box>
  );
}
