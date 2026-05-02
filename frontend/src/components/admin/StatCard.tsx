'use client';

import React from 'react';
import { Box, Typography, Card, CardContent, Stack, alpha } from '@mui/material';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
  secondary?: string;
}

export default function StatCard({ icon, label, value, color, secondary }: StatCardProps) {
  return (
    <Card sx={{
      borderRadius: 2, height: '100%',
      background: alpha(color, 0.05),
      border: `1px solid ${alpha(color, 0.1)}`,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': { transform: 'translateY(-6px)', background: alpha(color, 0.08), borderColor: alpha(color, 0.3) }
    }}>
      <Box sx={{
        position: 'absolute', top: -20, right: -20, width: 100, height: 100,
        background: `radial-gradient(circle, ${alpha(color, 0.15)} 0%, transparent 70%)`,
        filter: 'blur(20px)', zIndex: 0
      }} />
      <CardContent sx={{ position: 'relative', zIndex: 1, p: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
          <Box sx={{
            p: 1.5, borderRadius: 3, background: alpha(color, 0.1), color,
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>{icon}</Box>
          <Typography variant="body2" color="text.secondary" fontWeight={700} sx={{ textTransform: 'uppercase', letterSpacing: '1px' }}>{label}</Typography>
        </Stack>
        <Typography variant="h3" fontWeight={900} sx={{ color: 'white', mb: 0.5 }}>{value}</Typography>
        {secondary && <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600 }}>{secondary}</Typography>}
      </CardContent>
    </Card>
  );
}
