'use client';

import React from 'react';
import {
  Box,
  Typography,
  Button,
  alpha,
  useTheme,
} from '@mui/material';
import {
  SearchOff,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  searchQuery: string;
}

export default function EmptyState({ searchQuery }: EmptyStateProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleClearSearch = () => {
    router.push('/');
  };

  return (
    <Box sx={{
      textAlign: 'center',
      py: 12,
      px: 2,
      background: alpha(theme.palette.common.white, 0.02),
      borderRadius: 8,
      border: `1px dashed ${alpha(theme.palette.common.white, 0.1)}`
    }}>
      <SearchOff sx={{ fontSize: 80, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
      <Typography variant="h5" fontWeight={700} sx={{ mb: 1 }}>No events found</Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        We couldn't find any events matching "{searchQuery}". Try a different keyword.
      </Typography>
      <Button
        variant="outlined"
        onClick={handleClearSearch}
        sx={{ borderRadius: 3 }}
      >
        Clear Search
      </Button>
    </Box>
  );
}
