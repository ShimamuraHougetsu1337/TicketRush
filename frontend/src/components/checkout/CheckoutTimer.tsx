'use client';

import React, { useEffect, useState } from 'react';
import { Chip, alpha } from '@mui/material';
import { Timer as TimerIcon } from '@mui/icons-material';

interface CheckoutTimerProps {
  seats: any[];
  onExpire: () => void;
}

export default function CheckoutTimer({ seats, onExpire }: CheckoutTimerProps) {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    if (seats.length === 0) return;

    const interval = setInterval(() => {
      const lockTimes = seats.map(s => new Date(s.lockedAt).getTime());
      const earliestLock = Math.min(...lockTimes);
      const expiryTime = earliestLock + 10 * 60 * 1000;
      const now = new Date().getTime();
      const diff = expiryTime - now;

      if (diff <= 0) {
        clearInterval(interval);
        onExpire();
      } else {
        const mins = Math.floor(diff / 60000);
        const secs = Math.floor((diff % 60000) / 1000);
        setTimeLeft(`${mins}:${secs < 10 ? '0' : ''}${secs}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [seats, onExpire]);

  return (
    <Chip
      icon={<TimerIcon sx={{ fontSize: 16, color: 'inherit !important' }} />}
      label={`Ends in ${timeLeft}`}
      size="small"
      sx={{ 
        fontWeight: 900, 
        background: alpha('#ef4444', 0.1), 
        color: '#ef4444',
        px: 1,
        border: '1px solid rgba(239, 68, 68, 0.2)'
      }}
    />
  );
}
