'use client';

import React from 'react';
import { Box, Typography, Paper, alpha, useTheme } from '@mui/material';
import { QRCodeSVG } from 'qrcode.react';

interface TicketCardProps {
  seat: {
    id: number;
    ticketCode: string | null;
    rowName: string;
    seatNumber: number;
    zone: {
      name: string;
    };
  };
}

export default function TicketCard({ seat }: TicketCardProps) {
  const theme = useTheme();

  return (
    <Paper
      elevation={0}
      sx={{
        p: 0,
        borderRadius: 6,
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.05)',
        transition: 'all 0.3s ease',
        '&:hover': { 
          transform: 'translateY(-6px)', 
          borderColor: alpha(theme.palette.primary.main, 0.3) 
        }
      }}
    >
      <Box sx={{ p: 3, borderBottom: '1px dashed rgba(255,255,255,0.1)' }}>
        <Typography variant="h6" fontWeight={800} color="primary" sx={{ mb: 0.5 }}>
          {seat.zone.name} Zone
        </Typography>
        <Typography variant="body2" fontWeight={700} color="text.secondary">
          Row {seat.rowName} • Seat {seat.seatNumber}
        </Typography>
      </Box>

      <Box sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ p: 2.5, background: 'white', borderRadius: 4, mb: 3, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}>
          <QRCodeSVG value={seat.ticketCode || 'invalid'} size={160} />
        </Box>

        <Typography variant="caption" sx={{ fontFamily: 'monospace', letterSpacing: 4, fontWeight: 700, color: alpha('#fff', 0.5) }}>
          {seat.ticketCode}
        </Typography>
      </Box>

      <Box sx={{ py: 1.5, textAlign: 'center', background: alpha(theme.palette.primary.main, 0.05) }}>
        <Typography variant="caption" fontWeight={800} color="primary">VALID ADMISSION TICKET</Typography>
      </Box>
    </Paper>
  );
}
