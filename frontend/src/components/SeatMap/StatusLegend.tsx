'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';

interface StatusLegendProps {
  statusStyles: any;
}

const LEGEND_ITEMS = [
  ['AVAILABLE', 'Ghế trống'],
  ['SELECTED', 'Đang chọn'],
  ['MY_LOCK', 'Ghế của bạn'],
  ['LOCKED', 'Đã giữ'],
  ['SOLD', 'Đã bán']
] as const;

export default function StatusLegend({ statusStyles }: StatusLegendProps) {
  return (
    <Box sx={{ display: 'flex', gap: 2.5, flexWrap: 'wrap' }}>
      {LEGEND_ITEMS.map(([key, label]) => (
        <Box key={key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Box sx={{
            width: 14, height: 14, borderRadius: '2px',
            backgroundColor: statusStyles[key].bg,
            border: statusStyles[key].border,
            boxShadow: statusStyles[key].shadow || 'none'
          }} />
          <Typography 
            variant="caption" 
            fontWeight={700} 
            color="text.secondary" 
            sx={{ textTransform: 'uppercase', fontSize: '0.65rem', letterSpacing: '0.5px' }}
          >
            {label}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
