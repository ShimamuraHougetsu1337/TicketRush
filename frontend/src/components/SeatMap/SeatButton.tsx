'use client';

import React from 'react';
import { Box, alpha, useTheme } from '@mui/material';
import { useSeatStore } from '@/store/seat-store';

interface SeatButtonProps {
  seat: {
    id: number;
    status: string;
    seatNumber: number;
    lockedById: number | null;
  };
  currentUserId: number | null;
}

const SeatButton = React.memo(({
  seat,
  currentUserId,
}: SeatButtonProps) => {
  const theme = useTheme();
  const isSelected = useSeatStore(state => state.selectedIds.has(seat.id));
  const toggleSeat = useSeatStore(state => state.toggleSeat);

  const isMyLock = seat.status === 'LOCKED' && seat.lockedById === currentUserId;
  const isClickable = seat.status === 'AVAILABLE' || isSelected || isMyLock;

  const getColors = () => {
    // Priority 1: Seat is locked by the current user (Orange)
    if (isMyLock) {
      return { 
        bg: '#f59e0b', 
        color: '#000', 
        border: '#f59e0b',
        shadow: '0 0 15px rgba(245, 158, 11, 0.6)'
      };
    }
    
    // Priority 2: Seat is selected in the UI (Primary Blue)
    if (isSelected) {
      return { 
        bg: theme.palette.primary.main, 
        color: '#000', 
        border: theme.palette.primary.main,
        shadow: `0 0 15px ${alpha(theme.palette.primary.main, 0.6)}`
      };
    }
    
    // Default statuses
    switch (seat.status) {
      case 'AVAILABLE': 
        return { bg: alpha('#ffffff', 0.03), color: alpha('#ffffff', 0.5), border: 'rgba(255,255,255,0.1)', shadow: 'none' };
      case 'LOCKED': 
        return { bg: alpha('#1e293b', 0.5), color: '#475569', border: 'rgba(255,255,255,0.03)', shadow: 'none' };
      case 'SOLD': 
        return { bg: alpha('#ef4444', 0.05), color: alpha('#ef4444', 0.4), border: 'rgba(239, 68, 68, 0.2)', shadow: 'none' };
      default: 
        return { bg: 'transparent', color: 'inherit', border: 'transparent', shadow: 'none' };
    }
  };

  const colors = getColors();

  return (
    <Box
      onClick={() => isClickable && toggleSeat(seat.id)}
      sx={{
        width: { xs: 26, sm: 30 },
        height: { xs: 30, sm: 34 },
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '4px',
        fontSize: 10, fontWeight: 900, userSelect: 'none',
        transition: 'all 0.15s ease-out',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.color,
        cursor: isClickable ? 'pointer' : 'not-allowed',
        boxShadow: colors.shadow,
        '&:hover': isClickable ? {
          transform: 'scale(1.1) translateY(-2px)',
          borderColor: theme.palette.primary.main,
          backgroundColor: isSelected ? colors.bg : alpha(theme.palette.primary.main, 0.2),
          zIndex: 10
        } : {},
        ...(isSelected && {
          animation: 'pulse 1.5s infinite'
        })
      }}
    >
      {seat.seatNumber}
    </Box>
  );
});

SeatButton.displayName = 'SeatButton';

export default SeatButton;
