'use client';

import React from 'react';
import { Box, Typography, Stack, Button, alpha, useTheme, Chip } from '@mui/material';
import { DashboardCustomize, Refresh as RefreshIcon, FiberManualRecord } from '@mui/icons-material';

interface DashboardHeaderProps {
  eventCount: number;
  isLive?: boolean;
  onRefresh?: () => void;
}

export default function DashboardHeader({ eventCount, isLive, onRefresh }: DashboardHeaderProps) {
  const theme = useTheme();

  return (
    <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 6 }}>
      <Box sx={{ p: 1.5, borderRadius: 2, background: alpha(theme.palette.primary.main, 0.1), color: theme.palette.primary.main }}>
        <DashboardCustomize />
      </Box>
      <Box>
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="h3" fontWeight={900} sx={{ fontFamily: '"Outfit", sans-serif' }}>
            System Overview
          </Typography>
          {isLive && (
            <Chip
              icon={<FiberManualRecord sx={{ 
                fontSize: '12px !important', 
                color: '#ff4d4f',
                animation: 'pulse 1.5s infinite ease-in-out'
              }} />}
              label="LIVE"
              size="small"
              sx={{
                height: 24,
                backgroundColor: alpha('#ff4d4f', 0.1),
                color: '#ff4d4f',
                fontWeight: 900,
                fontSize: '0.65rem',
                border: '1px solid',
                borderColor: alpha('#ff4d4f', 0.2),
                '& .MuiChip-icon': { ml: 0.5 },
                '@keyframes pulse': {
                  '0%': { opacity: 1, transform: 'scale(1)' },
                  '50%': { opacity: 0.4, transform: 'scale(0.8)' },
                  '100%': { opacity: 1, transform: 'scale(1)' },
                }
              }}
            />
          )}
        </Stack>
        <Typography variant="body1" color="text.secondary">Real-time performance across {eventCount} active events</Typography>
      </Box>
      <Box sx={{ flexGrow: 1 }} />
      <Button
        variant="outlined"
        size="small"
        startIcon={<RefreshIcon />}
        onClick={onRefresh}
        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 700, px: 2 }}
      >
        Refresh Data
      </Button>
    </Stack>
  );
}
