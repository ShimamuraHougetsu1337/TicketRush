'use client';

import React from 'react';
import { Box, Typography, Stack, Button, alpha, useTheme } from '@mui/material';
import { DashboardCustomize } from '@mui/icons-material';

export default function DashboardHeader({ eventCount }: { eventCount: number }) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
        <DashboardCustomize />
      </Box>
      <Box>
        <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
          System Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">Real-time performance across {eventCount} active events</Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        variant="outlined"
        size="small"
        onClick={() => window.location.reload()}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700 }}
      >
        Refresh Data
      </Button>
    </Stack>
  );
}
