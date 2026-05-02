'use client';

import React from 'react';
import { Paper, Typography, Button, alpha } from '@mui/material';
import { ConfirmationNumber } from '@mui/icons-material';
import { useRouter } from 'next/navigation';

export default function EmptyTickets() {
  const router = useRouter();

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        p: 10, 
        textAlign: 'center', 
        borderRadius: 6, 
        border: '1px dashed rgba(255,255,255,0.1)', 
        background: alpha('#fff', 0.01) 
      }}
    >
      <ConfirmationNumber sx={{ fontSize: 80, color: 'text.secondary', mb: 3, opacity: 0.2 }} />
      <Typography variant="h5" fontWeight={800} gutterBottom>No tickets found</Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>You haven't purchased any tickets yet. Explore events and grab some!</Typography>
      <Button variant="contained" onClick={() => router.push('/')}>Browse Events</Button>
    </Paper>
  );
}
