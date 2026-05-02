'use client';

import React, { useMemo } from 'react';
import { Box, Tooltip, alpha } from '@mui/material';
import { useSeatStore, SeatData } from '@/store/seat-store';

interface SeatButtonProps {
  seat: SeatData;
  currentUserId: number | null;
  statusStyles: any;
  theme: any;
}

const SeatButton = React.memo(({
  seat,
  currentUserId,
  statusStyles,
  theme
}: SeatButtonProps) => {
  const isSelected = useSeatStore(state => state.selectedIds.has(seat.id));
  const toggleSeat = useSeatStore(state => state.toggleSeat);

  const isClickable = seat.status === 'AVAILABLE' || isSelected;

  const style = useMemo(() => {
    if (isSelected) return statusStyles.SELECTED;
    if (seat.status === 'LOCKED' && seat.lockedById === currentUserId) return statusStyles.MY_LOCK;
    return statusStyles[seat.status];
  }, [isSelected, seat.status, seat.lockedById, currentUserId, statusStyles]);

  return (
    <Tooltip title={`Row ${seat.rowName} • Seat ${seat.seatNumber} — ${seat.status}`} arrow>
      <Box
        onClick={() => isClickable && toggleSeat(seat.id)}
        sx={{
          width: { xs: 28, sm: 34 },
          height: { xs: 32, sm: 38 },
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: '4px',
          fontSize: 10, fontWeight: 900, userSelect: 'none',
          transition: 'all 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          backgroundColor: style.bg,
          border: style.border,
          color: style.color,
          cursor: style.cursor,
          boxShadow: style.shadow || 'none',
          '&:hover': isClickable ? {
            transform: 'translateY(-4px)',
            backgroundColor: style.hoverBg || style.bg,
            borderColor: theme.palette.primary.main,
            boxShadow: `0 8px 15px ${alpha(theme.palette.primary.main, 0.2)}`,
            zIndex: 10
          } : {},
          ...(isSelected && {
            animation: 'pulse 1.5s infinite'
          })
        }}
      >
        {seat.seatNumber}
      </Box>
    </Tooltip>
  );
});

SeatButton.displayName = 'SeatButton';

export default SeatButton;
