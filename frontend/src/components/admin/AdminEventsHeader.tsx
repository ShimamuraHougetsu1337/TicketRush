'use client';

import React from 'react';
import { Box, Typography, Button, Stack, alpha, useTheme } from '@mui/material';
import { Add as AddIcon, Event as EventIcon } from '@mui/icons-material';
import Link from 'next/link';

export default function AdminEventsHeader() {
  const theme = useTheme();

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 6 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
          <EventIcon />
        </Box>
        <Box>
          <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
            Events Management
          </Typography>
          <Typography variant="body1" color="text.secondary">Manage your platform events and seat mappings</Typography>
        </Box>
      </Box>
      
      <Button
        variant="contained"
        component={Link}
        href="/admin/events/new"
        startIcon={<AddIcon />}
        sx={{
          borderRadius: 3,
          px: 3,
          py: 1.5,
          fontWeight: 700,
          boxShadow: '0 8px 20px rgba(0, 242, 254, 0.2)'
        }}
      >
        Create New Event
      </Button>
    </Stack>
  );
}
