'use client';

import React from 'react';
import { Box, Container, Typography, Stack, alpha, useTheme } from '@mui/material';
import { LocalActivity } from '@mui/icons-material';

export default function TicketsHeader() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      pt: 10, 
      pb: 8, 
      borderBottom: '1px solid rgba(255, 255, 255, 0.05)', 
      background: alpha(theme.palette.primary.main, 0.03) 
    }}>
      <Container maxWidth="lg">
        <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
          <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
            <LocalActivity />
          </Box>
          <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
            My Tickets
          </Typography>
        </Stack>
        <Typography variant="h6" color="text.secondary" sx={{ maxWidth: 600 }}>
          Here are all your confirmed bookings. Show these QR codes at the venue entrance.
        </Typography>
      </Container>
    </Box>
  );
}
